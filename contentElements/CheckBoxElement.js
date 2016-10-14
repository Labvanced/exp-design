
var CheckBoxElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Checkbox";

    //serialized
    this.type= "CheckBoxElement";
    this.questionText= ko.observable("Your Question");

    this.choices= ko.observableArray([ko.observable("check")]);
    this.answer = ko.observableArray([false]);
    this.variable = ko.observable();
    this.margin = ko.observable('5pt');
    this.count = 0;

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

};

CheckBoxElement.prototype.modifiableProp = ["questionText"];

CheckBoxElement.prototype.changeCheck = function(index) {
    if (this.answer()[index]){
        this.answer.splice(index,1,false);
    }
    else {
        this.answer.splice(index,1,true);
    }
};


CheckBoxElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[3]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.parent.name());
    this.variable(globalVar);
};

CheckBoxElement.prototype.setPointers = function(entitiesArr) {
    var choices =  this.choices();
    this.choices = ko.observableArray([]);
    for (var i = 0; i< choices.length; i++){
        this.choices.push(ko.observable(choices[i]));
    }

    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

CheckBoxElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

CheckBoxElement.prototype.toJS = function() {
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

CheckBoxElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.choices(data.choices);
    this.variable(data.variable);
    this.answer(data.answer);
};

console.log("register checkbox element edit...");

function createCheckBoxComponents() {
    ko.components.register('checkbox-editview', {
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
                        this.choices.push(ko.observable("check"));
                        this.answer.push(false);
                    };

                    this.removeChoice = function(idx) {
                        this.choices.splice(idx,1);
                        this.answer.splice(idx,1);
                    };

                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'checkbox-editview-template'}
    });

    ko.components.register('checkbox-preview',{
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
        template: {element: 'checkbox-preview-template'}
    });

    ko.components.register('checkbox-playerview', {
        viewModel: function(dataModel){
            this.dataModel = dataModel;
            this.questionText = dataModel.questionText;
            this.choices = dataModel.choices;
            this.answer = dataModel.answer;
            this.margin = dataModel.margin;
        },
        template: {element: 'checkbox-playerview-template'}
    });
};

