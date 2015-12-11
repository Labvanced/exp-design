// � by Caspar Goeke and Holger Finger

// CHECK BOX  ELEMENT //
var CheckBoxElement= function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "checkBox";
    this.id = ko.observable(guid());
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
        id: this.id(),
        questionText: this.questionText(),
        choices: this.choices()
    };
};

CheckBoxElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
    this.choices(data.choices);
};
