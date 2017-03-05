
var ScaleElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Scale";

    //serialized
    this.type= "ScaleElement";
    this.id = ko.observable(guid());
    this.questionText= ko.observable('<span style="font-size:24px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');
    this.startChoice= ko.observable(1);
    this.endChoice= ko.observable(5);
    this.startLabel= ko.observable('<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">Left Label</span></span>');
    this.endLabel= ko.observable('<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">Right Label</span></span>');
    this.choices= ko.observableArray([1,2,3,4,5]);
    this.selected = ko.observable(false);
    this.variable = ko.observable();
    this.answer = ko.observableArray([]);
    this.showNums = ko.observable(true);
    this.margin = ko.observable('2pt');

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

ScaleElement.prototype.modifiableProp = ["questionText","startLabel","endLabel"];
ScaleElement.prototype.dataType =      [ "string","string","string"];
ScaleElement.prototype.initWidth = 340;
ScaleElement.prototype.initHeight = 140;

ScaleElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[2]);
    globalVar.name(this.parent.name());
    globalVar.startValue(0);
    globalVar.resetAtTrialStart(true);
    globalVar.recordAtTrialEnd(true);

    this.variable(globalVar);

    this.answer.subscribe(function (newValue) {
        this.variable().setValue(newValue);
    }, this);

};

ScaleElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.modifier().setPointers(entitiesArr);
};

ScaleElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.modifier().reAddEntities(entitiesArr);
};

ScaleElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

ScaleElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText(),
        startChoice: this.startChoice(),
        endChoice: this.endChoice(),
        startLabel: this.startLabel(),
        endLabel: this.endLabel(),
        choices: this.choices(),
        variable: variableId,
        answer: this.answer(),
        modifier: this.modifier().toJS()
    };
};

ScaleElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
    this.startChoice(data.startChoice);
    this.endChoice(data.endChoice);
    this.startLabel(data.startLabel);
    this.endLabel(data.endLabel);
    this.choices(data.choices);
    this.variable(data.variable);
    this.answer(data.answer);

    this.answer.subscribe(function (newValue) {
        this.variable().setValue(newValue);
    }, this);

    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};


function createScaleComponents() {
    ko.components.register('scale-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){

                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.choices = dataModel.choices;
                    this.startChoice = dataModel.startChoice;
                    this.endChoice = dataModel.endChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;
                    this.values = [1,2,3,4,5,6,7,8,9,10,11,12];
                    this.showNums = dataModel.showNums;
                    this.margin = dataModel.margin;

                    this.name = dataModel.parent.name;

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
        template: {element: 'scale-editview-template'}

    });

    ko.components.register('scale-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
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
        template: {element: 'scale-preview-template'}
    });

    ko.components.register('scale-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.startChoice = dataModel.startChoice;
                    this.endChoice = dataModel.endChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;
                    this.choices = dataModel.choices;
                    this.variable = dataModel.variable;
                    this.answer = dataModel.answer;
                    this.showNums = dataModel.showNums;
                    this.margin = dataModel.margin;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'scale-playerview-template'}
    });
};
