


var StartBlock = function(sequence) {

    var self = this;

    this.sequence = sequence;
    this.type = "StartBlock";
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


    // add output port
    this.outPort = new Port(this);
    this.outPort.x(40);
    this.outPort.type = "executeOut";
    this.ports.push(this.outPort);



    // add all port containers to this container:
    for (var i= 0, len=this.ports().length; i<len; i++) {
        this.container.addChild(this.ports()[i].container);
    }


    self.setCoord(250, 300);

};


StartBlock.prototype.setPointers = function() {

};


StartBlock.prototype.fromJS = function(start) {
    this.id(start.id);
    this.setCoord(start.x, start.y);
    for (var i= 0, len=start.ports.length; i<len; i++) {
        var port = new Port(this);
        port.fromJS(start.ports[i]);
        this.ports.push(port);
    }
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
        x: this.x(),
        y: this.y(),
        ports: portsSerialized
    };
};


StartBlock.prototype.setCoord = function(x,y) {

    this.x(x);
    this.y(y);
    this.container.x = x;
    this.container.y = y;


    return this;
};