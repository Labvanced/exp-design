


var EndBlock = function(parentSequence) {

    var self = this;

    this.parentSequence = parentSequence;
    this.type = "EndBlock";
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

    this.canvasElement = new CanvasElement(this);
    this.canvasElement.addPorts(this.ports());

    // add input port
    this.inPort = new Port(this);
    this.inPort.x(-40);
    this.inPort.type = "executeIn";
    this.ports.push(this.inPort);
};


EndBlock.prototype.setPointers = function() {

};

EndBlock.prototype.fromJS = function(end) {
    this.id(end.id);
    this.canvasElement.fromJS(end);
    for (var i= 0, len=end.ports.length; i<len; i++) {
        var port = new Port(this);
        port.fromJS(end.ports[i]);
        this.ports.push(port);
    }
    return this;
};


EndBlock.prototype.toJS = function() {
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
        x: this.canvasElement.x(),
        y: this.canvasElement.y(),
        ports: portsSerialized
    };
};

