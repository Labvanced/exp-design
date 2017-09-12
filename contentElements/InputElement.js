
var InputElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "InputElement";
    this.questionText = ko.observable(new EditableTextElement(expData, this, '<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>'));
    this.inputType = ko.observable('number');

    this.variable = ko.observable();

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};


InputElement.prototype.label = "Input";
InputElement.prototype.iconPath = "/resources/icons/tools/tool_input.svg";
InputElement.prototype.typeOptions = ["number","text","date","week","time","color"];
InputElement.prototype.initWidth = 300;
InputElement.prototype.initHeight = 100;
InputElement.prototype.dataTypePerInputType = {
    "number": 'numeric',
    "text": 'string',
    "date": 'datetime',
    "week": 'string',
    "time": 'string',
    "color": 'string'
};

InputElement.prototype.init = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType("numeric");
    globalVar.scope(GlobalVar.scopes[2]);
    globalVar.scale(GlobalVar.scales[1]);
    var name = this.parent.name();
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();

};

InputElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'Input');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
InputElement.prototype.getAllModifiers = function(modifiersArr) {
    this.questionText().getAllModifiers(modifiersArr);
};

InputElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.questionText().setPointers(entitiesArr);
};

InputElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.questionText().reAddEntities(entitiesArr);
};

InputElement.prototype.selectTrialType = function(selectionSpec) {
    this.questionText().selectTrialType(selectionSpec);
};

InputElement.prototype.dispose = function () {
    this.questionText().dispose();
};

InputElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    return textArr;
};

InputElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        inputType: this.inputType(),
        variable: variableId
    };
};

InputElement.prototype.fromJS = function(data) {
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')) {
        this.questionText = ko.observable(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else{
        this.questionText = ko.observable(new EditableTextElement(this.expData, this, data.questionText));
    }
    this.variable(data.variable);
    if (data.hasOwnProperty('inputType')){
        this.inputType(data.inputType);
    }
};


function createInputComponents() {
    ko.components.register('input-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    var self = this;

                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;

                    this.inputType = ko.pureComputed({
                        read: function () {
                            return this.dataModel.inputType();
                        },
                        write: function (inputType) {
                            // switch dataType of variable:
                            var newDataType = InputElement.prototype.dataTypePerInputType[inputType];
                            this.dataModel.variable().changeDataType(newDataType);
                            this.dataModel.inputType(inputType);
                        },
                        owner: this
                    });

                    this.allowedDataTypes = ko.computed(function() {
                        var allowedDataType = InputElement.prototype.dataTypePerInputType[self.dataModel.inputType()];
                        return [allowedDataType];
                    });

                    this.focus = function () {
                        this.dataModel.ckInstance.focus();
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

                return new viewModel(dataModel);
            }

        },
        template: {element: 'input-editview-template'}
    });


    ko.components.register('input-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;

                    this.value = ko.pureComputed({
                        read: function () {
                            return this.dataModel.variable().startValue().value();
                        },
                        write: function (value) {
                            // setValue will convert to the correct datatype:
                            this.dataModel.variable().startValue().setValue(value);
                        },
                        owner: this
                    });
                };
                return new viewModel(dataModel);
            }
        },
        template: { element: 'input-preview-template' }
    });


    ko.components.register('input-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;

                    this.value = ko.pureComputed({
                        read: function () {
                            return this.dataModel.variable().value().value();
                        },
                        write: function (value) {
                            // setValue will convert to the correct datatype:
                            this.dataModel.variable().value().setValue(value);
                        },
                        owner: this
                    });
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'input-playerview-template'}
    });
}


