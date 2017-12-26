
var CheckBoxElement= function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "CheckBoxElement";
    this.questionText = ko.observable(null); // needs to be an EditableTextElement

    // content
    this.elements = ko.observableArray([]);
    this.enableTitle= ko.observable(true);
    this.isRequired=ko.observable(false);
    this.reshuffleElements = ko.observable(false);


    // style
    this.margin = ko.observable('5pt');

    ///// not serialized
    this.selected = ko.observable(false);
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    /////
};

CheckBoxElement.prototype.label = "Checkbox";
CheckBoxElement.prototype.iconPath = "/resources/icons/tools/tool_checkbox.svg";
CheckBoxElement.prototype.dataType =      [ ];
CheckBoxElement.prototype.modifiableProp = [ ];
CheckBoxElement.prototype.initWidth = 180;
CheckBoxElement.prototype.initHeight = 90;

CheckBoxElement.prototype.init = function() {
    this.questionText(new EditableTextElement(this.expData, this, '<p><span style="font-size:20px;">Your Question</span></p>'));
    this.questionText().init();
    this.addEntry();
};

CheckBoxElement.prototype.addEntry = function() {
     var checkBoxEntry = new CheckBoxEntry(this);
     checkBoxEntry.init();
     this.elements.push(checkBoxEntry);
};

CheckBoxElement.prototype.removeEntry = function() {
    var idx = this.elements().length-1;
    var entry =  this.elements()[idx];
    // delete associated global vars
    this.parent.parent.localWorkspaceVars.remove(entry.variable());
    this.elements.splice(idx,1);
};


CheckBoxElement.prototype.doReshuffle = function() {
    var elemCopy = this.elements().slice();
    var reshuffledArray = this.parent.parent.parent.parent.reshuffle(elemCopy);
    this.elements(reshuffledArray);
};


CheckBoxElement.prototype.isInputValid = function() {
    this.triedToSubmit(true);
    if (this.isRequired()===false){
        this.dataIsValid(true);
        return true;
    }
    else{
        var valid = false;
        // answer is counted as valid if at least one checkbox is marked:
        this.elements().forEach(function(subElem) {
            if (subElem.variable().value().value()){
                valid = true;
            }
        });
        this.dataIsValid(valid);
        return valid;
    }
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
CheckBoxElement.prototype.getAllModifiers = function(modifiersArr) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.getAllModifiers(modifiersArr);
    } );
    this.questionText().getAllModifiers(modifiersArr);
};

CheckBoxElement.prototype.setPointers = function(entitiesArr) {

    for (var i=0; i<this.elements().length; i++) {
        this.elements()[i].setPointers(entitiesArr);
    }
    this.questionText().setPointers(entitiesArr);
};

CheckBoxElement.prototype.reAddEntities = function(entitiesArr) {

    jQuery.each( this.elements(), function( index, elem ) {
        elem.reAddEntities(entitiesArr);
    } );
    this.questionText().reAddEntities(entitiesArr);
};

CheckBoxElement.prototype.selectTrialType = function(selectionSpec) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.selectTrialType(selectionSpec);
    } );
    this.questionText().selectTrialType(selectionSpec);
};

CheckBoxElement.prototype.dispose = function () {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.dispose();
    } );
    this.questionText().dispose();
};

CheckBoxElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    jQuery.each( this.elements(), function( index, elem ) {
        var ind = index + 1;
        elem.getTextRefs(textArr, label + '.Entry' + ind);
    } );
    return textArr;
};


CheckBoxElement.prototype.toJS = function() {

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem.toJS();
        }),
        enableTitle:this.enableTitle(),
        isRequired:this.isRequired(),
        reshuffleElements:this.reshuffleElements()
    };
};

CheckBoxElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')){
        this.questionText(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else{
        this.questionText(new EditableTextElement(this.expData, this, data.questionText));
    }
    if (data.elements) {
        this.elements(jQuery.map(data.elements, function (elemData) {
            return (new CheckBoxEntry(self)).fromJS(elemData);
        }));
    }
    if(data.hasOwnProperty('enableTitle')){
        this.enableTitle(data.enableTitle);
    }
    if(data.hasOwnProperty('isRequired')){
        this.isRequired(data.isRequired);
    }
    if(data.hasOwnProperty('reshuffleElements')){
        this.reshuffleElements(data.reshuffleElements);
    }



};





var CheckBoxEntry= function(checkBoxParent) {
    this.parent = checkBoxParent;
    this.checkBoxText = ko.observable(null); // needs to be an EditableTextElement
    this.variable=ko.observable(null);
};


CheckBoxEntry.prototype.selectTrialType = function(selectionSpec) {
    this.checkBoxText().selectTrialType(selectionSpec);
};

CheckBoxEntry.prototype.init = function() {
    this.checkBoxText(new EditableTextElement(this.parent.expData, this.parent, '<p><span style="font-size:16px;">check</span></p>'));
    this.checkBoxText().init();

    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[2]);
    globalVar.scope('trial');
    globalVar.scale(GlobalVar.scales[1]);
    var name = this.parent.parent.name() +'_'+ this.parent.elements().length;
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();
};

CheckBoxEntry.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent.parent, true, true, 'checkbox');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
CheckBoxEntry.prototype.getAllModifiers = function(modifiersArr) {
    this.checkBoxText().getAllModifiers(modifiersArr);
};

CheckBoxEntry.prototype.setPointers = function(entitiesArr) {
    this.variable(entitiesArr.byId[this.variable()]);
    this.setVariableBackRef();
    this.checkBoxText().setPointers(entitiesArr);
};

CheckBoxEntry.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.checkBoxText().reAddEntities(entitiesArr);
};

CheckBoxEntry.prototype.dispose = function () {
  this.checkBoxText().dispose();
};

CheckBoxEntry.prototype.getTextRefs = function(textArr, label){
    this.checkBoxText().getTextRefs(textArr, label);
};

CheckBoxEntry.prototype.fromJS = function(data) {
    if(data.checkBoxText.hasOwnProperty('rawText')){
        this.checkBoxText(new EditableTextElement(this.parent.expData, this.parent, ''));
        this.checkBoxText().fromJS(data.checkBoxText);
    }
    else{
        this.checkBoxText(new EditableTextElement(this.parent.expData, this.parent, data.checkBoxText));
    }

    this.variable(data.variable);
    return this;
};

CheckBoxEntry.prototype.toJS = function() {
    return {
        variable:  this.variable().id(),
        checkBoxText:  this.checkBoxText().toJS()
    };
};


function createCheckBoxComponents() {
    ko.components.register('checkbox-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){

                    var self = this;

                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.margin = dataModel.margin;

                    this.addChoice = function() {
                        this.dataModel.addEntry();
                    };

                    this.removeChoice = function() {
                        this.dataModel.removeEntry();
                    };

                    this.focus = function () {
                        this.dataModel.ckInstance.focus();
                    };

                    this.relinkCallback = function(index) {
                        var frameData = self.dataModel.parent.parent;
                        var checkboxEntry = self.dataModel.elements()[index];
                        var variableDialog = new AddNewVariable(self.dataModel.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            checkboxEntry.variable(newVariable);
                            checkboxEntry.setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };

                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'checkbox-editview-template'}
    });

    ko.components.register('checkbox-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.margin = dataModel.margin;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'checkbox-preview-template'}
    });

    ko.components.register('checkbox-playerview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.margin = dataModel.margin;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'checkbox-playerview-template'}
    });
};

