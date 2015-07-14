
var Sequence = function () {

    this.elements = ko.observableArray();

};

Sequence.prototype.fromJS = function(sequence) {
    var elements = [];
    if (sequence.hasOwnProperty('elements')) {
        for (var i= 0, len=sequence.elements.length; i<len; i++) {
            elements[i] = new QuestionaireBlock();
            elements[i].fromJS(sequence.elements[i]);
        }
    }
    this.elements = ko.observableArray(elements);

    return this;
};


Sequence.prototype.toJS = function() {

    var elements = [];
    for (var i= 0, len=this.elements().length; i<len; i++) {
        elements.push(this.elements()[i].toJS());
    }

    return {
        elements: elements
    };
};