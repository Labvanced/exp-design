
var MultipleChoiceElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "MultipleChoiceElement";
    this.questionText= ko.observable('<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');

   // this.openQuestion=  ko.observable(false);

    // content
    this.elements = ko.observableArray([]);
    this.variable = ko.observable();

    this.margin = ko.observable('5pt');

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

MultipleChoiceElement.prototype.label = "Multiple Choice";
MultipleChoiceElement.prototype.iconPath = "/resources/icons/tools/tool_multiplechoice.svg";
MultipleChoiceElement.prototype.modifiableProp = ["questionText"];
MultipleChoiceElement.prototype.dataType =      [ "string"];
MultipleChoiceElement.prototype.initWidth = 180;
MultipleChoiceElement.prototype.initHeight = 120;



MultipleChoiceElement.prototype.init = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType('string');
    globalVar.scope(GlobalVar.scopes[2]);
    globalVar.scale(GlobalVar.scales[0]);
    var name = this.parent.name();
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();

    this.addEntry();
    this.addEntry();
};

MultipleChoiceElement.prototype.addEntry = function() {
    var multChoice = new MultipleChoiceEntry(this);
    multChoice.init();
    this.elements.push(multChoice);
};

MultipleChoiceElement.prototype.removeEntry = function() {
    var idx = this.elements().length-1;
    this.elements.splice(idx,1);
};

MultipleChoiceElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'multipleChoice');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
MultipleChoiceElement.prototype.getAllModifiers = function(modifiersArr) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.getAllModifiers(modifiersArr);
    } );
    modifiersArr.push(this.modifier());
};

MultipleChoiceElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.modifier().setPointers(entitiesArr);
    jQuery.each( this.elements(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
    if (this.variable().dataType() == "categorical") {
        // convert to string type:
        this.variable().changeDataType("string");
    }
};

MultipleChoiceElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.modifier().reAddEntities(entitiesArr);
};

MultipleChoiceElement.prototype.selectTrialType = function(selectionSpec) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.selectTrialType(selectionSpec);
    } );
    this.modifier().selectTrialType(selectionSpec);
};

MultipleChoiceElement.prototype.toJS = function() {

    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText(),
        variable: variableId,
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem.toJS();
        }),
        modifier: this.modifier().toJS()
    };
};

MultipleChoiceElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    this.questionText(data.questionText);
    this.variable(data.variable);

    if (data.elements) {
        this.elements(jQuery.map(data.elements, function (elemData) {
            return (new MultipleChoiceEntry(self)).fromJS(elemData);
        }));
    }

    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};





//////////////////////////////////////////////
////// MultipleChoiceEntry
//////////////////////////////////////////////


var MultipleChoiceEntry= function(multChoiceParent) {
    this.multChoiceParent = multChoiceParent;

    this.multChoiceText = ko.observable(null);
    this.multChoiceValue = ko.observable(null);

    this.modifier = ko.observable(new Modifier(this.multChoiceParent.expData, this));
};

MultipleChoiceEntry.prototype.modifiableProp = ["multChoiceText"];
MultipleChoiceEntry.prototype.dataType =["string"];


MultipleChoiceEntry.prototype.getIndex = function() {
   return this.multChoiceParent.elements.indexOf(this);
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
MultipleChoiceEntry.prototype.getAllModifiers = function(modifiersArr) {
    modifiersArr.push(this.modifier());
};

MultipleChoiceEntry.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

MultipleChoiceEntry.prototype.init = function() {
    var nr = this.multChoiceParent.elements().length;
    var initText = '<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">option_' +nr+'</span></span>';
    this.multChoiceText( initText );
    this.multChoiceValue( 'option_' +nr );
};

MultipleChoiceEntry.prototype.setPointers = function(entitiesArr) {
    if (this.multChoiceValue() == null) {
        // convert from old categorical format to string format:
        var nr = this.multChoiceParent.elements().indexOf(this);
        this.multChoiceValue( 'option_' +nr );
    }
};

MultipleChoiceEntry.prototype.fromJS = function(data) {
    this.multChoiceText(data.multChoiceText);
    if (data.hasOwnProperty('multChoiceValue')) {
        this.multChoiceValue(data.multChoiceValue);
    }
    return this;
};

MultipleChoiceEntry.prototype.toJS = function() {
    return {
        multChoiceText:  this.multChoiceText(),
        multChoiceValue: this.multChoiceValue()
    };
};











function createMultipleChoiceComponents() {
    ko.components.register('choice-editview', {
        viewModel: {
            createViewModel: function(multipleChoiceElement, componentInfo){

                var viewModel = function(multipleChoiceElement){
                    var self = this;

                    this.multipleChoiceElement = multipleChoiceElement;
                    this.questionText = multipleChoiceElement.questionText;
                    this.margin = multipleChoiceElement.margin;

                    this.addChoice = function() {
                        self.multipleChoiceElement.addEntry();
                    };

                    this.removeChoice = function() {
                        self.multipleChoiceElement.removeEntry();
                    };

                    this.focus = function () {
                        self.multipleChoiceElement.ckInstance.focus();
                    };

                    this.relinkCallback = function() {
                        var frameData = self.dataModel.parent.parent;
                        var variableDialog = new AddNewVariable(self.dataModel.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            self.multipleChoiceElement.variable(newVariable);
                            self.multipleChoiceElement.setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };
                };

                return new viewModel(multipleChoiceElement);
            }
        },
        template: {element: 'choice-editview-template'}
    });

    ko.components.register('choice-preview',{
        viewModel: {
            createViewModel: function(multipleChoiceElement, componentInfo){
                var viewModel = function(multipleChoiceElement){
                    this.multipleChoiceElement = multipleChoiceElement;
                    this.questionText = multipleChoiceElement.questionText;
                    this.margin = multipleChoiceElement.margin;
                };
                return new viewModel(multipleChoiceElement);
            }
        },
        template: {element: 'choice-preview-template'}
    });

    ko.components.register('choice-playerview', {
        viewModel: {
            createViewModel: function(multipleChoiceElement, componentInfo){

                var viewModel = function (multipleChoiceElement) {
                    this.multipleChoiceElement = multipleChoiceElement;
                    this.questionText = multipleChoiceElement.questionText;
                    this.margin = multipleChoiceElement.margin;
                };
                return new viewModel(multipleChoiceElement);
            }
        },
        template: {element: 'choice-playerview-template'}
    });
};
