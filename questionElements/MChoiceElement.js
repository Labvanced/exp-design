// � by Caspar Goeke and Holger Finger

// MULTIPLE CHOICE ELEMENT //
var MChoiceElement = function(expData) {
    this.expData = expData;
    this.type= "mChoice";
    this.id = ko.observable(guid());
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
        id: this.id(),
        questionText: this.questionText(),
        choices: this.choices()
    };
};

MChoiceElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
    this.choices(data.choices);
};
