
var Sequence = function (parentSequence) {

    var self = this;
    this.parentSequence = parentSequence;
    // serialized
    this.id = ko.observable(guid());
    this.type = "Sequence";

    // not serialized
    this.shape = "square";
    this.label = "Experiment";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observableArray();
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);

    // ordered Elements by Id:
    this.elementsById = {};
    this.elements.subscribe(function() {
        self.elementsById = {};
        var elements = self.elements();
        for (var i= 0, len=elements.length; i<len; i++) {
            self.elementsById[elements[i].id()] = elements[i];
        }
    });

    // add Ports to Renderer
    this.canvasElement.addPorts(this.portHandler.ports());
};

Sequence.prototype.setPointers = function() {
    var elements = this.elements();
    for (var i= 0, len=elements.length; i<len; i++) {
        elements[i].setPointers();
    }
};


Sequence.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.experimentEditor.setDataModel(this);
};

Sequence.prototype.fromJS = function(sequence) {

    this.id(sequence.id);
    this.type = sequence.type;
    this.portHandler.fromJS(sequence.portHandler);
    this.canvasElement.fromJS(sequence.canvasElement);

    var elements = [];
    if (sequence.hasOwnProperty('elements')) {
        for (var i= 0, len=sequence.elements.length; i<len; i++) {
            if (sequence.elements[i].type == 'Start'){
                elements[i] = new StartBlock(this);
            }
            else if (sequence.elements[i].type == 'End'){
                elements[i] = new EndBlock(this);
            }
            else if (sequence.elements[i].type == 'QuestionnaireEditorData'){
                elements[i] = new QuestionnaireEditorData(this);
            }
            else if (sequence.elements[i].type == 'Connection'){
                elements[i] = new Connection(this);
            }
            else if (sequence.elements[i].type == 'Sequence'){
                elements[i] = new Sequence(this);
            }
            else if (sequence.elements[i].type == 'TextEditorData'){
                elements[i] = new TextEditorData(this);
            }
            else if (sequence.elements[i].type == 'ImageEditorData'){
                elements[i] = new ImageEditorData(this);
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
        id: this.id(),
        type: this.type,
        portHandler:this.portHandler.toJS(),
        canvasElement: this.canvasElement.toJS(),
        elements: elements
    };
};
