
var TextElement = function() {
    this.type= "text";
    this.name= guid();
    this.editing=  ko.observable(true);
    this.questionText= ko.observable("");
};

TextElement.prototype.finishQuestion = function() {
    this.editing(false);
};

TextElement.prototype.toJS = function() {
    return {
        type: this.type,
        name: this.name,
        editing: this.editing(),
        questionText: this.questionText()
    };
};

TextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.name=data.name;
    this.editing(data.editing);
    this.questionText(data.questionText);
};