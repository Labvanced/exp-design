
var MultipleChoiceElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "MultipleChoiceElement";
    this.questionText = ko.observable(new EditableTextElement(this.expData, this, '<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>'));
    this.isRequired = ko.observable(false);

   // this.openQuestion=  ko.observable(false);

    // content
    this.elements = ko.observableArray([]);
    this.variable = ko.observable();

    this.margin = ko.observable('5pt');

    ///// not serialized
    this.selected = ko.observable(false);
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    /////


};

MultipleChoiceElement.prototype.label = "Multiple Choice";
MultipleChoiceElement.prototype.iconPath = "/resources/icons/tools/tool_multiplechoice.svg";
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
    this.questionText().getAllModifiers(modifiersArr);
};

MultipleChoiceElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    jQuery.each( this.elements(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
    if (this.variable().dataType() == "categorical") {
        // convert to string type:
        this.variable().changeDataType("string");
    }
    this.questionText().setPointers();
};

MultipleChoiceElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    jQuery.each( this.elements(), function( index, elem ) {
        elem.reAddEntities(entitiesArr);
    } );
    this.questionText().reAddEntities(entitiesArr);
};

MultipleChoiceElement.prototype.selectTrialType = function(selectionSpec) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.selectTrialType(selectionSpec);
    } );
    this.questionText().selectTrialType(selectionSpec);
};

MultipleChoiceElement.prototype.dispose = function () {
    this.questionText().dispose();
    jQuery.each( this.elements(), function( index, elem ) {
        elem.dispose();
    } );
};

MultipleChoiceElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    jQuery.each( this.elements(), function( index, elem ) {
        var ind = index + 1;
        elem.getTextRefs(textArr, label + '.Entry' + ind);
    } );
    return textArr;
};


MultipleChoiceElement.prototype.isInputValid = function() {
    this.triedToSubmit(true);
    if (this.isRequired()==false){
        this.dataIsValid(true);
        return true
    }
    else{
        if (this.variable().value().value() == this.variable().startValue().value()){
            this.dataIsValid(false);
            return false;
        }
        else{
            this.dataIsValid(true);
            return true
        }
    }
};


MultipleChoiceElement.prototype.toJS = function() {

    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        variable: variableId,
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem.toJS();
        }),
        isRequired:this.isRequired()
    };
};

MultipleChoiceElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')){
        this.questionText = ko.observable(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else{
        this.questionText = ko.observable(new EditableTextElement(this.expData, this, data.questionText));
    }
    this.variable(data.variable);

    if (data.elements) {
        this.elements(jQuery.map(data.elements, function (elemData) {
            return (new MultipleChoiceEntry(self)).fromJS(elemData);
        }));
    }
    if(data.hasOwnProperty('isRequired')){
        this.isRequired(data.isRequired);
    }


};





//////////////////////////////////////////////
////// MultipleChoiceEntry
//////////////////////////////////////////////


var MultipleChoiceEntry= function(multChoiceParent) {
    this.parent = multChoiceParent;

    this.multChoiceText = ko.observable(new EditableTextElement(this.parent.expData, this.parent, ''));
    this.multChoiceValue = ko.observable(null);

};



MultipleChoiceEntry.prototype.getIndex = function() {
   return this.parent.elements.indexOf(this);
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
MultipleChoiceEntry.prototype.getAllModifiers = function(modifiersArr) {
    this.multChoiceText().getAllModifiers(modifiersArr);
};

MultipleChoiceEntry.prototype.selectTrialType = function(selectionSpec) {
    this.multChoiceText().selectTrialType(selectionSpec);
};

MultipleChoiceEntry.prototype.init = function() {
    var nr = this.parent.elements().length;
    var initText = '<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">option_' +nr+'</span></span>';
    this.multChoiceText().rawText( initText );
    this.multChoiceValue( 'option_' +nr );
};

MultipleChoiceEntry.prototype.reAddEntities = function (entitiesArr) {
    this.multChoiceText().reAddEntities(entitiesArr);
};

MultipleChoiceEntry.prototype.setPointers = function(entitiesArr) {
    if (this.multChoiceValue() == null) {
        // convert from old categorical format to string format:
        var nr = this.parent.elements().indexOf(this);
        this.multChoiceValue( $($.parseHTML(this.multChoiceText())).text() );
    }
    this.multChoiceText().setPointers(entitiesArr);
};

MultipleChoiceEntry.prototype.dispose = function () {
    this.multChoiceText().dispose();
};

MultipleChoiceEntry.prototype.getTextRefs = function(textArr, label){
    this.multChoiceText().getTextRefs(textArr, label);
};

MultipleChoiceEntry.prototype.fromJS = function(data) {
    if(data.multChoiceText.hasOwnProperty('rawText')) {
        this.multChoiceText = ko.observable(new EditableTextElement(this.parent.expData, this.parent, ''));
        this.multChoiceText().fromJS(data.multChoiceText);
    }
    else{
        this.multChoiceText = ko.observable(new EditableTextElement(this.parent.expData, this.parent, data.multChoiceText));
    }
    if (data.hasOwnProperty('multChoiceValue')) {
        this.multChoiceValue(data.multChoiceValue);
    }
    return this;
};

MultipleChoiceEntry.prototype.toJS = function() {
    return {
        multChoiceText:  this.multChoiceText().toJS(),
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
                        var frameData = self.multipleChoiceElement.parent.parent;
                        var variableDialog = new AddNewVariable(self.multipleChoiceElement.expData, function (newVariable) {
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
