// � by Caspar Goeke and Holger Finger


var TextElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "text";
    this.id = ko.observable(guid());
    this.editing=  ko.observable(true);
    this.questionText= ko.observable("");
};

TextElement.prototype.finishQuestion = function() {
    this.editing(false);
};

TextElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText()
    };
};

TextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
};