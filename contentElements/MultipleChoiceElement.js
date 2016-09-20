
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

                this.focus = function () {
                    if(dataModel.ckeditor){
                        dataModel.ckeditor.focus();
                    }
                };

            };

            return new viewModel(dataModel);
        }
    },
    template:
        '<div class="panel-body" style="height: 100%; margin-top: -10px">\
                    <div>\
                        <span>Element Tag:</span>\
                        <br>\
                        <input style="max-width:50%;" type="text" data-bind="textInput: $parent.name"> \
                    </div>\
                    <br>\
                    <div>\
                        <span style="display: inline-block">Question Text</span>\
                        <span style="display: inline-block"><img style="cursor: pointer" width="20" height="20" src="/resources/edit.png" data-bind="click: focus"></span>\
                   </div>\
                    <span><a href="#" data-bind="click: addChoice"><img style="display: inline-block;" width="20" height="20"src="/resources/add.png"/> Add Choice</a></span>\
                    <br><br>\
            </div>'
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
    template:
        '<div class="notDraggable" data-bind="wysiwyg: questionText, valueUpdate: \'afterkeydown\'"><p>Your Question</p></div>\
        <div data-bind="foreach: choices, style: {marginTop: margin, marginBottom: margin}">\
            <div>\
                <input style="margin-top: inherit; margin-bottom: inherit; display: inline-block" type="radio" data-bind="click: function(){ $root.changeCheck($index()); return true}, clickBubble: false">\
                <div style="display: inline-block" class="notDraggable" data-bind="wysiwyg: $rawData, valueUpdate: \'afterkeydown\'"></div>\
            </div>\
        </div>\
        <br>'
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
    template:
        '<div style="font-size: 200%" data-bind="text: questionText"></div>\
        <div data-bind=\"foreach: choices, style: {marginTop: margin, marginBottom: margin}\">\
            <input style="margin-bottom: inherit; margin-top: inherit" type=\"radio\" data-bind="attr: {value:$data}, checked: $root.answer, click: function(){return true}, clickBubble: false\">\
            <span style="margin-bottom: inherit; margin-top: inherit" data-bind=\"text: $data\"></span>\
        </div>\
        <br>'
});