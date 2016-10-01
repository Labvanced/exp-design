
var MultipleChoiceElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Multiple Choice";

    //serialized
    this.type= "MultipleChoiceElement";
    this.questionText= ko.observable("Your Question");

    this.openQuestion=  ko.observable(false);
    this.choices= ko.observableArray([ko.observable("choice 1"),ko.observable("choice 2")]);
    this.selected = ko.observable(false);
    this.variable = ko.observable();
    this.answer = ko.observable("");
    this.margin = ko.observable('5pt');

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

MultipleChoiceElement.prototype.modifiableProp = ["questionText"];

MultipleChoiceElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.parent.name());
    this.variable(globalVar);
};

MultipleChoiceElement.prototype.setPointers = function(entitiesArr) {
    var choices =  this.choices();
    this.choices = ko.observableArray([]);
    for (var i = 0; i< choices.length; i++){
        this.choices.push(ko.observable(choices[i]));
    }

    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

MultipleChoiceElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

MultipleChoiceElement.prototype.toJS = function() {
    var choices = [];
    for (var i = 0; i< this.choices().length; i++){
        choices.push(this.choices()[i]());
    }

    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText(),
        choices: choices,
        variable: variableId,
        answer: this.answer()
    };
};

MultipleChoiceElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.choices(data.choices);
    this.variable(data.variable);
    this.answer(data.answer);
};

function createMultipleChoiceComponents() {
    ko.components.register('choice-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.choices = dataModel.choices;
                    this.answer = dataModel.answer;
                    this.margin = dataModel.margin;
                    this.name = dataModel.parent.name;

                    this.addChoice = function() {
                        this.choices.push(ko.observable("choice"));
                    };

                    this.removeChoice = function(idx) {
                        this.choices.splice(idx,1);
                    };
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'choice-editview-template'}
    });

    ko.components.register('choice-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var elem = componentInfo.element.firstChild;
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.choices = dataModel.choices;
                    this.margin = dataModel.margin;
                    this.count = dataModel.count;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'choice-preview-template'}
    });

    ko.components.register('choice-playerview', {
        viewModel: function(dataModel){

            this.dataModel = dataModel;
            this.questionText = dataModel.questionText;
            this.openQuestion = dataModel.openQuestion;
            this.newChoice = dataModel.newChoice;
            this.choices = dataModel.choices;
            this.newPage = dataModel.newPage;
            this.answer = dataModel.answer;
            this.margin = dataModel.margin;
        },
        template: {element: 'choice-playerview-template'}
    });
};
