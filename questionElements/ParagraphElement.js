// � by Caspar Goeke and Holger Finger

// PARAGRAPH ELEMENT //
var ParagraphElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "paragraph";
    this.id = ko.observable(guid());
    this.editing=  ko.observable(true);
    this.questionText= ko.observable("");
};

ParagraphElement.prototype.finishQuestion = function() {
    this.editing(false);
};

ParagraphElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText()
    };
};

ParagraphElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
};
