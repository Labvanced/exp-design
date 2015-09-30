


var StartBlock = function(parentSequence) {

    var self = this;

    this.parentSequence = parentSequence;
    this.type = "StartBlock";
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

    // add output port
    this.outPort = new Port(this);
    this.outPort.x(40);
    this.outPort.type = "executeOut";
    this.ports.push(this.outPort);

    this.canvasElement = new CanvasElement(this);
    this.canvasElement.addPorts(this.ports());

    /**
    this.container = new createjs.Container();

    var circ = new createjs.Shape();
    circ.graphics.beginStroke("black").beginFill("gray").drawCircle(0, 0, 40);
    circ.addEventListener("pressmove", function (ev) {
        var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
        self.setCoord( mouseAt.x, mouseAt.y  );
    });
    this.container.addChild(circ);

    var txt = new createjs.Text("Start", "16px Arial", "#FFF");
    txt.textAlign = 'center';
    this.container.addChild(txt);


    // add all port containers to this container:
    for (var i= 0, len=this.ports().length; i<len; i++) {
        this.container.addChild(this.ports()[i].container);
    }


    self.setCoord(250, 300);
     **/

};


StartBlock.prototype.setPointers = function() {

};


StartBlock.prototype.fromJS = function(start) {
    this.id(start.id);
    this.canvasElement.fromJS(start);
    for (var i= 0, len=start.ports.length; i<len; i++) {
        var port = new Port(this);
        port.fromJS(start.ports[i]);
        this.ports.push(port);
    }
    this.canvasElement = new CanvasElement(this);
    this.canvasElement.addPorts(this.ports());
    return this;
};


StartBlock.prototype.toJS = function() {
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
