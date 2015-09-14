
// CHECK BOX  ELEMENT //
var CheckBoxElement= function() {
    this.type= "checkBox";
    this.name= guid();
    this.editing=  ko.observable(true);
    this.questionText= ko.observable("");

    this.openQuestion=  ko.observable(false);
    this.newChoice= ko.observable("");
    this.choices= ko.observableArray([]);
};

CheckBoxElement.prototype.finishQuestion = function() {
    this.editing(false);
};

CheckBoxElement.prototype.addChoice = function() {
    this.openQuestion(true);
};

CheckBoxElement.prototype.addReadyChoice = function() {
    this.choices.push(this.newChoice());
    this.newChoice("");
    this.openQuestion(false);
};

CheckBoxElement.prototype.removeReadyChoice = function(idx) {
    this.choices.splice(idx,1);
};

CheckBoxElement.prototype.toJS = function() {
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

CheckBoxElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.name=data.name;
    this.editing(data.editing);
    this.questionText(data.questionText);
    this.openQuestion(data.openQuestion);
    this.newChoice(data.newChoice);
    this.choices(data.choices);
};
