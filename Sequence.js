
var Sequence = function () {

    var self = this;
    this.elements = ko.observableArray();
    this.elementsById = {};

    this.elements.subscribe(function() {

        self.elementsById = {};
        var elements = self.elements();
        for (var i= 0, len=elements.length; i<len; i++) {
            self.elementsById[elements[i].id()] = elements[i];
        }

    });


};

Sequence.prototype.setPointers = function() {
    var elements = this.elements();
    for (var i= 0, len=elements.length; i<len; i++) {
        elements[i].setPointers();
    }
};

Sequence.prototype.fromJS = function(sequence) {
    var elements = [];
    if (sequence.hasOwnProperty('elements')) {
        for (var i= 0, len=sequence.elements.length; i<len; i++) {
            if (sequence.elements[i].type == 'StartBlock'){
                elements[i] = new StartBlock(this);
            }
            else if (sequence.elements[i].type == 'EndBlock'){
                elements[i] = new EndBlock(this);
            }
            else if (sequence.elements[i].type == 'QuestionaireBlock'){
                elements[i] = new QuestionaireBlock(this);
            }
            else if (sequence.elements[i].type == 'Connection'){
                elements[i] = new Connection(this);
            }

            elements[i].fromJS(sequence.elements[i]);
        }
    }
    this.elements(elements);

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