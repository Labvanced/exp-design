
var MultiLineInputElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "MultiLineInputElement";
    this.questionText = ko.observable(null); // EditableTextElement
    this.variable = ko.observable();
    this.isRequired = ko.observable(false);
    this.enableTitle= ko.observable(true);
    this.customHeight = ko.observable(100);
    this.customWidth = ko.observable(100);

    this.outerHeight = ko.observable(50);

    ///// not serialized
    this.selected = ko.observable(false);
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);




};

MultiLineInputElement.prototype.label = "Paragraph";
MultiLineInputElement.prototype.iconPath = "/resources/icons/tools/textInput.svg";
MultiLineInputElement.prototype.dataType =      [ ];
MultiLineInputElement.prototype.modifiableProp = [ ];
MultiLineInputElement.prototype.initWidth = 500;
MultiLineInputElement.prototype.initHeight = 100;






MultiLineInputElement.prototype.recalcHeight = function() {
    if (this.parent.hasOwnProperty('editorHeight')){
        this.outerHeight((this.parent.editorHeight()-50));
    }

};

MultiLineInputElement.prototype.init = function() {

    this.questionText(new EditableTextElement(this.expData, this, '<p><span style="font-size:20px;">Your Question</span></p>'));
    this.questionText().init();

    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[0]);
    globalVar.scope('trial');
    globalVar.scale(GlobalVar.scales[1]);
    var name = this.parent.name();
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();

    this.recalcHeight();

};

MultiLineInputElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'longTextInput');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
MultiLineInputElement.prototype.getAllModifiers = function(modifiersArr) {
    this.questionText.getAllModifiers(modifiersArr);
};

MultiLineInputElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.questionText().setPointers(entitiesArr);
    this.recalcHeight();
};

MultiLineInputElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.questionText().reAddEntities(entitiesArr);
};

MultiLineInputElement.prototype.selectTrialType = function(selectionSpec) {
    this.questionText().selectTrialType(selectionSpec);
};

MultiLineInputElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'multiLineInput');
};

MultiLineInputElement.prototype.dispose = function () {
    this.questionText().dispose();
};

MultiLineInputElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    return textArr;
};

MultiLineInputElement.prototype.isInputValid = function() {
    this.triedToSubmit(true);
    if (this.isRequired()==false){
        this.dataIsValid(true);
        return true
    }
    else{
        if (this.variable().value().value()==null || this.variable().value().value()=='' ||this.variable().value().value() == this.variable().startValue().value()){
            this.dataIsValid(false);
            return false;
        }
        else{
            this.dataIsValid(true);
            return true
        }
    }
};


MultiLineInputElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        variable: variableId,
        isRequired:this.isRequired(),
        enableTitle:this.enableTitle(),
        customHeight:this.customHeight(),
        customWidth:this.customWidth(),
        outerHeight:this.outerHeight()

    };
};



MultiLineInputElement.prototype.fromJS = function(data) {
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')) {
        this.questionText(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else{
        this.questionText(new EditableTextElement(this.expData, this, data.questionText));
    }
    this.variable(data.variable);
    if(data.hasOwnProperty('isRequired')) {
        this.isRequired(data.isRequired);
    }
    if(data.hasOwnProperty('enableTitle')){
        this.enableTitle(data.enableTitle);
    }
    if(data.hasOwnProperty('customHeight')){
        this.customHeight(data.customHeight);
    }
    if(data.hasOwnProperty('customWidth')){
        this.customWidth(data.customWidth);
    }
    if(data.hasOwnProperty('outerHeight')){
        this.outerHeight(data.outerHeight);
    }


};

function createMultiLineInputComponents() {
    ko.components.register('multi-line-input-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;

                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;

                    this.focus = function () {
                        dataModel.ckInstance.focus();
                    };

                    this.relinkCallback = function() {
                        var frameData = self.dataModel().parent.parent;
                        var variableDialog = new AddNewVariable(self.dataModel().expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            self.dataModel().variable(newVariable);
                            self.dataModel().setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };
                };
                return new viewModel(dataModel);
            }
        } ,
        template: {element: 'multi-line-input-editview-template'}
    });

    ko.components.register('multi-line-input-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'multi-line-input-preview-template'}
    });

    ko.components.register('multi-line-input-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.answer = dataModel.answer;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'multi-line-input-playerview-template'}
    });
}
