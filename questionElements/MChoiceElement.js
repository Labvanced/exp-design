// � by Caspar Goeke and Holger Finger

// MULTIPLE CHOICE ELEMENT //
var MChoiceElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "mChoice";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("Your Question");

    this.openQuestion=  ko.observable(false);
    this.choices= ko.observableArray([ko.observable("choice 1"),ko.observable("choice 2")]);
    this.selected = ko.observable(false);
    this.tag = ko.observable("");
    this.variable = ko.observable();
    this.answer = ko.observable("");
};

MChoiceElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[7]);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.tag());
    this.variable(globalVar);
};

MChoiceElement.prototype.setPointers = function(entitiesArr) {
    var choices =  this.choices();
    this.choices = ko.observableArray([]);
    for (var i = 0; i< choices.length; i++){
        this.choices.push(ko.observable(choices[i]));
    }

    this.variable(entitiesArr.byId[this.variable()]);
};

MChoiceElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

MChoiceElement.prototype.toJS = function() {
    var choices = [];
    for (var i = 0; i< this.choices().length; i++){
        choices.push(this.choices()[i]());
    }

    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText(),
        choices: choices,
        variable: this.variable().id(),
        answer: this.answer()
    };
};

MChoiceElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
    this.choices(data.choices);
    this.variable(data.variable);
    this.answer(data.answer);
};

ko.components.register('choice-element-edit', {
    viewModel: function(dataModel){

        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.openQuestion = dataModel.openQuestion;
        this.choices = dataModel.choices;

        this.addChoice = function() {
            this.choices.push(ko.observable(""));
        };

        this.removeChoice = function(idx) {
            this.choices.splice(idx,1);
        };

    },
    template:
        '<div class="panel-body">\
            <input style="max-width:50%" type="text" data-bind="textInput: questionText"\
                class="form-control" placeholder="Your Question">\
            <br>\
            <div data-bind="foreach: choices">\
                <div style="overflow: auto; margin-bottom: 3%">\
                    <input style="float: left; margin-top: 3%" type="checkbox">\
                    <input style="float: left; margin-left: 5%; max-width:50%" type="text" data-bind="textInput: $rawData" class="form-control">\
                    <span style="float: left; margin-left: 5%; margin-top: 1%;"><a href="#" data-bind="click: function(data,event) {$parent.removeChoice($index())}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
                </div>\
            </div>\
        <span><a href="#" data-bind="click: addChoice"><img style="display: inline-block;" width="20" height="20"src="/resources/add.png"/> <h5 style="display: inline-block; margin-left: 1%">Add Choice</h5> </a></span>\
        </div>'
});


ko.components.register('choice-element-preview', {
   viewModel: function(dataModel){

       this.dataModel = dataModel;
       this.questionText = dataModel.questionText;
       this.openQuestion = dataModel.openQuestion;
       this.newChoice = dataModel.newChoice;
       this.choices = dataModel.choices;
       this.newPage = dataModel.newPage;
   },
    template:
        '<div class=\"panel-heading\">\
        <span style="float: right"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
        <h3 style="float: left">\
            <span data-bind=\"text: questionText\"></span>\
         </h3>\
        </div>\
        <br><br><br><br>\
        <div class=\"panel-body\">\
        <div data-bind=\"foreach: choices\">\
            <input style="transform: scale(1.3); margin-bottom: 2%" type=\"radio\" data-bind=\"attr: {name: \'radio\'+ $parent.name}, click: function(){return true}, clickBubble: false\">\
                <span style="font-size: large; margin-left: 1%" \
                    data-bind=\"text: $data\">\
                </span>\
            <br>\
        </div>\
        </div>'
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
    },
    template:
        '<div class=\"panel-heading\">\
         <h3 style="float: left">\
            <span data-bind=\"text: questionText\"></span>\
         </h3>\
        </div>\
        <br><br>\
        <div class=\"panel-body\">\
        <div data-bind=\"foreach: choices\">\
            <input style="transform: scale(1.3); margin-bottom: 2%" type=\"radio\" data-bind="attr: {value:$data}, checked: $root.answer, click: function(){return true}, clickBubble: false\">\
            <span style="font-size: large; margin-left: 1%" data-bind=\"text: $data\"></span>\
            <br>\
        </div>\
        </div>'
});