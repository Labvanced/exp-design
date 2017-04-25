
var MultiLineInputElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "MultiLineInputElement";
    this.questionText= ko.observable('<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');
    this.variable = ko.observable();

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

MultiLineInputElement.prototype.label = "Paragraph";
MultiLineInputElement.prototype.iconPath = "/resources/icons/tools/textInput.svg";
MultiLineInputElement.prototype.modifiableProp = ["questionText"];
MultiLineInputElement.prototype.dataType =      [ "string"];
MultiLineInputElement.prototype.initWidth = 500;
MultiLineInputElement.prototype.initHeight = 100;


MultiLineInputElement.prototype.init = function() {
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

MultiLineInputElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'longTextInput');
};

MultiLineInputElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.modifier().setPointers(entitiesArr);
};

MultiLineInputElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.modifier().reAddEntities(entitiesArr);
};

MultiLineInputElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

MultiLineInputElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'multiLineInput');
};

MultiLineInputElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText(),
        variable: variableId,
        modifier: this.modifier().toJS()
    };
};

MultiLineInputElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.variable(data.variable);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};

function createMultiLineInputComponents() {
    ko.components.register('multi-line-input-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.questionText = dataModel.questionText;

                    this.focus = function () {
                        dataModel.ckInstance.focus()
                    }
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
                    this.dataModel = dataModel;
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
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.answer = dataModel.answer;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'multi-line-input-playerview-template'}
    });
}
