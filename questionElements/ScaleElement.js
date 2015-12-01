// � by Caspar Goeke and Holger Finger


// SCALE ELEMENT//
var ScaleElement= function(expData) {
    this.expData = expData;
    this.type= "scale";
    this.id = ko.observable(guid());
    this.editing=  ko.observable(true);
    this.questionText= ko.observable("");
    this.startChoice= ko.observable(1);
    this.endChoice= ko.observable(5);
    this.startLabel= ko.observable("");
    this.endLabel= ko.observable("");
    this.choices= ko.observableArray([]);
};

ScaleElement.prototype.finishQuestion = function() {
    this.editing(false);
    this.choices([]);
    for (var i = this.startChoice();i<=this.endChoice();i++){
        this.choices.push(i);
    }
};

ScaleElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText(),
        startChoice: this.startChoice(),
        endChoice: this.endChoice(),
        startLabel: this.startLabel(),
        endLabel: this.endLabel(),
        choices: this.choices()
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
};

