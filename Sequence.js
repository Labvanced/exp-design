
var Sequence = function (parentSequence) {

    var self = this;


    // properties when as block in parent
    this.parentSequence = parentSequence;
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
        uc.experimentEditor.setDataModel(self);
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

Sequence.prototype.fromJS = function(parentSequence) {

    this.id(parentSequence.id);
    this.setCoord(parentSequence.x, parentSequence.y);
    for (var i= 0, len=parentSequence.ports.length; i<len; i++) {
        var port = new Port(this);
        port.fromJS(parentSequence.ports[i]);
        this.ports.push(port);
    }


    var elements = [];
    if (parentSequence.hasOwnProperty('elements')) {
        for (var i= 0, len=parentSequence.elements.length; i<len; i++) {
            if (parentSequence.elements[i].type == 'StartBlock'){
                elements[i] = new StartBlock(this);
            }
            else if (parentSequence.elements[i].type == 'EndBlock'){
                elements[i] = new EndBlock(this);
            }
            else if (parentSequence.elements[i].type == 'QuestionnaireEditorData'){
                elements[i] = new QuestionnaireEditorData(this);
            }
            else if (parentSequence.elements[i].type == 'Connection'){
                elements[i] = new Connection(this);
            }
            else if (parentSequence.elements[i].type == 'Sequence'){
                elements[i] = new Sequence(this);
            }
            else if (parentSequence.elements[i].type == 'TextEditorData'){
                elements[i] = new TextEditorData(this);
            }
            else if (parentSequence.elements[i].type == 'ImageEditorData'){
                elements[i] = new ImageEditorData(this);
            }

            elements[i].fromJS(parentSequence.elements[i]);
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