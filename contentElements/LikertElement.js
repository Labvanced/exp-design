var LikertElement= function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "LikertElement";
    this.questionText= ko.observable('<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');
    this.startChoice= ko.observable(1);
    this.endChoice= ko.observable(5);
    this.startLabel= ko.observable('<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">Left Label</span></span>');
    this.endLabel= ko.observable('<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">Right Label</span></span>');
    this.choices= ko.observableArray([1,2,3,4,5]);

    this.variable = ko.observable();

    this.showNums = ko.observable(true);
    this.margin = ko.observable('2pt');

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

LikertElement.prototype.label = "Likert";
LikertElement.prototype.iconPath = "/resources/icons/tools/tool_rating.svg";
LikertElement.prototype.modifiableProp = ["questionText","startLabel","endLabel"];
LikertElement.prototype.dataType =      [ "string","string","string"];
LikertElement.prototype.initWidth = 350;
LikertElement.prototype.initHeight = 120;

LikertElement.prototype.init = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
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

LikertElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'Likert');
};

LikertElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.modifier().setPointers(entitiesArr);
};

LikertElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.modifier().reAddEntities(entitiesArr);
};

LikertElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

LikertElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText(),
        startChoice: this.startChoice(),
        endChoice: this.endChoice(),
        startLabel: this.startLabel(),
        endLabel: this.endLabel(),
        choices: this.choices(),
        variable: variableId,
        modifier: this.modifier().toJS()
    };
};

LikertElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.startChoice(data.startChoice);
    this.endChoice(data.endChoice);
    this.startLabel(data.startLabel);
    this.endLabel(data.endLabel);
    this.choices(data.choices);
    this.variable(data.variable);

    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};


function createLikertElementComponents() {
    ko.components.register('likert-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){

                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.choices = dataModel.choices;
                    this.startChoice = dataModel.startChoice;
                    this.endChoice = dataModel.endChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;
                    this.values = [1,2,3,4,5,6,7,8,9,10,11,12];
                    this.showNums = dataModel.showNums;
                    this.margin = dataModel.margin;

                    this.finish = function() {
                        this.choices([]);
                        for (var i = this.startChoice();i<=this.endChoice();i++){
                            this.choices.push(i);
                        }
                    };

                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };

                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'likert-editview-template'}

    });

    ko.components.register('likert-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.margin = dataModel.margin;
                    this.startChoice = dataModel.startChoice;
                    this.choices = dataModel.choices;
                    this.variable = dataModel.variable;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'likert-preview-template'}
    });

    ko.components.register('likert-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function (dataModel) {
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.startChoice = dataModel.startChoice;
                    this.endChoice = dataModel.endChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;
                    this.choices = dataModel.choices;
                    this.variable = dataModel.variable;
                    this.showNums = dataModel.showNums;
                    this.margin = dataModel.margin;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'likert-playerview-template'}
    });
};
