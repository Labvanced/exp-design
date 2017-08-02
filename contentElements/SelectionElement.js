
var SelectionElement = function(expData) {
    var self = this;
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "SelectionElement";
    this.questionText = ko.observable(new EditableTextElement(this.expData, this, '<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>'))

    this.elements = ko.observableArray([]);
    this.variable = ko.observable();

    ///// not serialized
    this.selected = ko.observable(false);
};

SelectionElement.prototype.label = "Selection";
SelectionElement.prototype.iconPath = "/resources/icons/tools/selection.svg";
SelectionElement.prototype.initWidth = 300;
SelectionElement.prototype.initHeight = 100;


SelectionElement.prototype.addEntry = function(newName) {
    var entry = new SelectionEntry(this);
    entry.selectionText(newName);
    entry.selectionValue(newName);
    this.elements.push(entry);
};

SelectionElement.prototype.removeEntry = function(idx) {
    this.elements.splice(idx,1);
};

SelectionElement.prototype.init = function() {
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

};

SelectionElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'Selection');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
SelectionElement.prototype.getAllModifiers = function(modifiersArr) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.getAllModifiers(modifiersArr);
    } );
    this.questionText().getAllModifiers(modifiersArr);
};

SelectionElement.prototype.setPointers = function(entitiesArr) {
    var self = this;
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    jQuery.each( this.elements(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
    if (this.variable().dataType() == "categorical") {
        // convert to string type:
        jQuery.each( this.variable().levels(), function( index, elem ) {
            var entry = new SelectionEntry(this);
            entry.selectionText(elem.name());
            entry.selectionValue(elem.name());
            self.elements.push(entry);
        } );
        this.variable().changeDataType("string");
    }
    this.questionText().setPointers();
};

SelectionElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.questionText().reAddEntities(entitiesArr);
};

SelectionElement.prototype.selectTrialType = function(selectionSpec) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.selectTrialType(selectionSpec);
    } );
    this.questionText().selectTrialType(selectionSpec);
};

SelectionElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
};

SelectionElement.prototype.toJS = function() {
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
        })
    };
};

SelectionElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')) {
        this.questionText = ko.observable(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else{
        this.questionText = ko.observable(new EditableTextElement(this.expData, this, data.questionText));
    }
    this.variable(data.variable);
    if (data.hasOwnProperty('elements')) {
        this.elements(jQuery.map(data.elements, function (elemData) {
            return (new SelectionEntry(self)).fromJS(elemData);
        }));
    }

};




//////////////////////////////////////////////
////// SelectionEntry
//////////////////////////////////////////////


var SelectionEntry= function(selectionParent) {
    this.selectionParent = selectionParent;

    this.selectionText = ko.observable(null);
    this.selectionValue = ko.observable(null);

};

SelectionEntry.prototype.getIndex = function() {
    return this.selectionParent.elements.indexOf(this);
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
SelectionEntry.prototype.getAllModifiers = function(modifiersArr) {
   // this.selectionText().getAllModifiers(modifiersArr);
};

SelectionEntry.prototype.selectTrialType = function(selectionSpec) {
  //  this.selectionText().selectTrialType(selectionSpec);
};

SelectionEntry.prototype.setPointers = function(entitiesArr) {
    if (this.selectionValue() == null) {
        // convert from old categorical format to string format:
        var nr = this.selectionParent.elements().indexOf(this);
        this.selectionValue( 'option_' +nr );
    }
 //   this.selectionText().setPointers(entitiesArr);
};

SelectionEntry.prototype.fromJS = function(data) {
    this.selectionText(data.selectionText);
    if (data.hasOwnProperty('selectionValue')) {
        this.selectionValue(data.selectionValue);
    }
    return this;
};

SelectionEntry.prototype.toJS = function() {
    return {
        selectionText:  this.selectionText(),
        selectionValue: this.selectionValue()
    };
};



function createSelectionElementComponents() {
    ko.components.register('selection-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.currentEntry = ko.observable('');
                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };

                    this.relinkCallback = function() {
                        var frameData = self.dataModel.parent.parent;
                        var variableDialog = new AddNewVariable(self.dataModel.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            self.dataModel.variable(newVariable);
                            self.dataModel.setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };
                };

                viewModel.prototype.addEntry = function() {
                  this.dataModel.addEntry(this.currentEntry());
                  this.currentEntry('');
                };
                viewModel.prototype.removeEntry = function(idx) {
                    this.dataModel.removeEntry(idx);
                };

                return new viewModel(dataModel);
            }

        },
        template: {element: 'selection-editview-template'}
    });


    ko.components.register('selection-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;

                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };
                };

                return new viewModel(dataModel);
            }
        },
        template: { element: 'selection-preview-template' }
    });


    ko.components.register('selection-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;

                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'selection-playerview-template'}
    });
}



