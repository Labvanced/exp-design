// © by Caspar Goeke and Holger Finger

// PARAGRAPH ELEMENT //
var ParagraphElement = function() {
    this.type= "paragraph";
    this.name= guid();
    this.editing=  ko.observable(true);
    this.questionText= ko.observable("");
};

ParagraphElement.prototype.finishQuestion = function() {
    this.editing(false);
};

ParagraphElement.prototype.toJS = function() {
    return {
        type: this.type,
        name: this.name,
        editing: this.editing(),
        questionText: this.questionText()
    };
};

ParagraphElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.name=data.name;
    this.editing(data.editing);
    this.questionText(data.questionText);
};
