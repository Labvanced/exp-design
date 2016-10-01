
var RangeElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Range";

    //serialized
    this.type= "RangeElement";
    this.questionText= ko.observable("Your Question");
    this.minChoice= ko.observable(1);
    this.maxChoice= ko.observable(5);
    this.startLabel= ko.observable("start label");
    this.endLabel= ko.observable("end label");
    this.answer = ko.observable(1);
    this.newPage = ko.observable(false);
    this.selected = ko.observable(false);
    this.variable = ko.observable();

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

};

RangeElement.prototype.modifiableProp = ["questionText","startLabel","endLabel"];

RangeElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[2]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[3]);
    globalVar.name(this.parent.name());
    this.variable(globalVar);
};


RangeElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

RangeElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

RangeElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText(),
        minChoice: this.minChoice(),
        maxChoice: this.maxChoice(),
        startLabel: this.startLabel(),
        endLabel: this.endLabel(),
        variable: variableId,
        answer: this.answer()
    };
};

RangeElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.minChoice(data.minChoice);
    this.maxChoice(data.maxChoice);
    this.startLabel(data.startLabel);
    this.endLabel(data.endLabel);
    this.variable(data.variable);
    this.answer(data.answer);
};


function createRangeComponents() {
    ko.components.register('range-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){

                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.minChoice = dataModel.minChoice;
                    this.maxChoice = dataModel.maxChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;
                    this.name = dataModel.parent.name;
                    
                };

                return new viewModel(dataModel)
            }
        },
        template: {element: 'range-editview-template'}
    });

    ko.components.register('range-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){

                    var self = this;
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.minChoice = dataModel.minChoice;
                    this.maxChoice = dataModel.maxChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;

                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'range-preview-template'}
    });

    ko.components.register('range-playerview',{
        viewModel: function(dataModel){
            this.dataModel = dataModel;
            this.questionText = dataModel.questionText;
            this.minChoice = dataModel.minChoice;
            this.maxChoice = dataModel.maxChoice;
            this.startLabel = dataModel.startLabel;
            this.endLabel = dataModel.endLabel;
            this.answer = dataModel.answer;
            this.newPage = dataModel.newPage;
        },
        template: {element: 'range-playerview-template'}
    });
};
