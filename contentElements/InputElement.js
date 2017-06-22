
var InputElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "InputElement";
    this.questionText= ko.observable('<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');
    this.inputType = ko.observable('number');

    this.variable = ko.observable();

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};


InputElement.prototype.label = "Input";
InputElement.prototype.iconPath = "/resources/icons/tools/tool_input.svg";
InputElement.prototype.modifiableProp = ["questionText"];
InputElement.prototype.typeOptions = ["number","text","date","week","time","color"];
InputElement.prototype.dataType =      [ "string"];
InputElement.prototype.initWidth = 300;
InputElement.prototype.initHeight = 100;


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
    modifiersArr.push(this.modifier());
};

InputElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.modifier().setPointers(entitiesArr);
};

InputElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.modifier().reAddEntities(entitiesArr);
};

InputElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

InputElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        questionText: this.questionText(),
        inputType: this.inputType(),
        variable: variableId,
        modifier: this.modifier().toJS()
    };
};

InputElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.variable(data.variable);
    if (data.hasOwnProperty('inputType')){
        this.inputType(data.inputType);
    }
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};


function createInputComponents() {
    ko.components.register('input-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;

                    this.inputType = ko.pureComputed({
                        read: function () {
                            return this.dataModel.inputType();
                        },
                        write: function (inputType) {
                            // switch dataType of variable:
                            var newDataType = "undefined";

                            switch (inputType) {
                                case "number":
                                    newDataType = 'numeric';
                                    break;
                                case "text":
                                    newDataType = 'string';
                                    break;
                                case "date":
                                    newDataType = 'datetime';
                                    break;
                                case "week":
                                    newDataType = 'string';
                                    break;
                                case "time":
                                    newDataType = 'string';
                                    break;
                                case "color":
                                    newDataType = 'string';
                                    break;
                            }

                            this.dataModel.variable().changeDataType(newDataType);
                            this.dataModel.inputType(inputType);
                        },
                        owner: this
                    });

                    this.focus = function () {
                        this.dataModel.ckInstance.focus();
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


