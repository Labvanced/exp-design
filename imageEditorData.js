


var ImageEditorData = function(parentSequence) {

    var self = this;

    this.parentSequence = parentSequence;
    this.type = "ImageEditorData";
    this.id = ko.observable(guid());

    this.currSelectedElement = ko.observable(0);
    this.elements = ko.observableArray([]);

    this.ports = ko.observableArray();
    this.portsById = {};
    this.ports.subscribe(function() {
        self.portsById = {};
        var ports = self.ports();
        for (var i= 0, len=ports.length; i<len; i++) {
            self.portsById[ports[i].id()] = ports[i];
        }
    });

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


    this.canvasElement = new CanvasElement(this,"rectangle");
    this.canvasElement.addPorts(this.ports());

};



ImageEditorData.prototype.setPointers = function() {

};


ImageEditorData.prototype.fromJS = function(textBlock) {
    this.id(textBlock.id);
    this.canvasElement.fromJS(textBlock);
    for (var i= 0, len=textBlock.ports.length; i<len; i++) {
        var port = new Port(this);
        port.fromJS(textBlock.ports[i]);
        this.ports.push(port);
    }
    return this;

};


ImageEditorData.prototype.toJS = function() {
    var self = this;
    var ports = self.ports();
    var portsSerialized = [];

    for (var i= 0, len=ports.length; i<len; i++) {
        portsSerialized.push(ports[i].toJS());
    }
    return {
        id: this.id(),
        type: this.type,
        canvasElement: this.canvasElement.toJS(),
        ports: portsSerialized

    };
};


