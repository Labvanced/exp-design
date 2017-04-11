
var TextInputElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Text";

    //serialized
    this.type = "TextInputElement";
    this.questionText= ko.observable('<span style="font-size:24px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');
    this.variable = ko.observable();

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

TextInputElement.prototype.modifiableProp = ["questionText"];
TextInputElement.prototype.dataType =      [ "string"];

TextInputElement.prototype.init = function() {
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

TextInputElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'textInput');
};

TextInputElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.modifier().setPointers(entitiesArr);
};

TextInputElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.modifier().reAddEntities(entitiesArr);
};

TextInputElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

TextInputElement.prototype.toJS = function() {
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

TextInputElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.variable(data.variable);

    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};


function createTextInputComponents() {
    // TODO: @Holger Add image FileManager
    ko.components.register('text-input-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.name = dataModel.parent.name;

                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };
                };

                return new viewModel(dataModel);
            }

        },
        template: {element: 'text-input-editview-template'}
    });


    ko.components.register('text-input-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                };
                return new viewModel(dataModel);
            }
        },
        template: { element: 'text-input-preview-template' }
    });


    ko.components.register('text-input-playerview',{
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
        template: {element: 'text-input-playerview-template'}
    });
}


