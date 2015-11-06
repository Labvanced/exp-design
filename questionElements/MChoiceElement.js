// © by Caspar Goeke and Holger Finger

// MULTIPLE CHOICE ELEMENT //
var MChoiceElement = function() {
    this.type= "mChoice";
    this.name= guid();
    this.editing=  ko.observable(true);
    this.questionText= ko.observable("");

    this.openQuestion=  ko.observable(false);
    this.newChoice= ko.observable("");
    this.choices= ko.observableArray([]);
};

MChoiceElement.prototype.finishQuestion = function() {
    this.editing(false);
};

MChoiceElement.prototype.addChoice = function() {
    this.openQuestion(true);
};

MChoiceElement.prototype.addReadyChoice = function() {
    this.choices.push(this.newChoice());
    this.newChoice("");
    this.openQuestion(false);
};

MChoiceElement.prototype.removeReadyChoice = function(idx) {
    this.choices.splice(idx,1);
};

MChoiceElement.prototype.toJS = function() {
    return {
        type: this.type,
        name: this.name,
        editing: this.editing(),
        questionText: this.questionText(),
        openQuestion: this.openQuestion(),
        newChoice: this.newChoice(),
        choices: this.choices()
    };
};

MChoiceElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.name=data.name;
    this.editing(data.editing);
    this.openQuestion(data.openQuestion);
    this.openQuestion(data.openQuestion);
    this.newChoice(data.newChoice);
    this.choices(data.choices);
};
