
var InputElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Input";

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


InputElement.prototype.modifiableProp = ["questionText"];
InputElement.prototype.typeOptions = ["number","text","date","week","time","color"];
InputElement.prototype.dataType =      [ "string"];
InputElement.prototype.initWidth = 300;
InputElement.prototype.initHeight = 100;


InputElement.prototype.init = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[0]);
    globalVar.scope(GlobalVar.scopes[4]);
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
    this.variable().addBackRef(this, this.parent, true, true, 'textInput');
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
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.name = dataModel.parent.name;


                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
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
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
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
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.answer = dataModel.answer;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'input-playerview-template'}
    });
}


