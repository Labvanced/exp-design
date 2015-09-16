
var Sequence = function (sequence) {

    var self = this;


    // properties when as block in parent
    this.sequence = sequence;
    this.type = "Sequence";
    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.id = ko.observable(guid());
    this.ports = ko.observableArray();
    this.portsById = {};
    this.ports.subscribe(function() {
        self.portsById = {};
        var ports = self.ports();
        for (var i= 0, len=ports.length; i<len; i++) {
            self.portsById[ports[i].id()] = ports[i];
        }
    });
    this.container = new createjs.Container();
    self.setCoord(550, 300);



    var rect = new createjs.Shape();
    rect.graphics.beginStroke("black").beginFill("gray").drawRect(-100, -50, 200, 100);
    rect.addEventListener("pressmove", function (ev) {
        var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
        self.setCoord(mouseAt.x, mouseAt.y);
    });
    rect.addEventListener("dblclick", function (ev) {
        uc.experimentEditor.editSequence(self);
    });
    this.container.addChild(rect);


    var txt = new createjs.Text("Block", "16px Arial", "#FFF");
    txt.textAlign = 'center';
    this.container.addChild(txt);




    // add input port
    this.inPort = new Port(this);
    this.inPort.x(-100);
    this.inPort.type = "executeIn";
    this.ports.push(this.inPort);



    // add output port
    this.outPort = new Port(this);
    this.outPort.x(100);
    this.outPort.type = "executeOut";
    this.ports.push(this.outPort);



    // add all port containers to this container:
    for (var i= 0, len=this.ports().length; i<len; i++) {
        this.container.addChild(this.ports()[i].container);
    }



    // properties used when looking within this sequence:
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

    this.id(sequence.id);
    this.setCoord(sequence.x, sequence.y);
    for (var i= 0, len=sequence.ports.length; i<len; i++) {
        var port = new Port(this);
        port.fromJS(sequence.ports[i]);
        this.ports.push(port);
    }


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
            else if (sequence.elements[i].type == 'Sequence'){
                elements[i] = new Sequence(this);
            }
            else if (sequence.elements[i].type == 'TextBlock'){
                elements[i] = new TextBlock(this);
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

    var self = this;
    var ports = self.ports();
    var portsSerialized = [];
    for (var i= 0, len=ports.length; i<len; i++) {
        portsSerialized.push(ports[i].toJS());
    }
    var elements = [];
    for (var i= 0, len=this.elements().length; i<len; i++) {
        elements.push(this.elements()[i].toJS());
    }
    return {
        id: this.id(),
        type: this.type,
        x: this.x(),
        y: this.y(),
        elements: elements,
        ports: portsSerialized
    };
};



Sequence.prototype.setCoord = function(x,y) {
    this.x(x);
    this.y(y);
    this.container.x = x;
    this.container.y = y;
    return this;
};