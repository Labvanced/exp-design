
var TextInputElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Text";

    //serialized
    this.type = "TextInputElement";
    this.questionText= ko.observable('<span style="font-size:22px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');
    this.selected = ko.observable(false);
    this.variable = ko.observable();
    this.answer = ko.observable("");

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

TextInputElement.prototype.modifiableProp = ["questionText"];

TextInputElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.parent.name());
    this.variable(globalVar);
};

TextInputElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

TextInputElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
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
        answer: this.answer()
    };
};

TextInputElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.variable(data.variable);
    this.answer(data.answer);
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


