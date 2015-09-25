


var TextEditorData = function(parentSequence) {

    var self = this;

    this.parentSequence = parentSequence;
    this.type = "TextBlock";
    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.id = ko.observable(guid());

    this.textData = ko.observable('');

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

    var rect = new createjs.Shape();
    rect.graphics.beginStroke("black").beginFill("gray").drawRect(-100, -50, 200, 100);
    rect.addEventListener("pressmove", function (ev) {
        var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
        self.setCoord(mouseAt.x, mouseAt.y);
    });
    var self = this;
    rect.addEventListener("dblclick", function (ev) {
        uc.textEditorData = self;
        page("/page/texteditor");
    });
    this.container.addChild(rect);

    var txt = new createjs.Text("Text", "16px Arial", "#FFF");
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

    self.setCoord(550, 300);

};



TextEditorData.prototype.setPointers = function() {

};


TextEditorData.prototype.fromJS = function(textBlock) {
    this.id(textBlock.id);
    this.setCoord(textBlock.x, textBlock.y);
    for (var i= 0, len=textBlock.ports.length; i<len; i++) {
        var port = new Port(this);
        port.fromJS(textBlock.ports[i]);
        this.ports.push(port);
    }
    this.textData(textBlock.textData);
    return this;

};


TextEditorData.prototype.toJS = function() {
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
        textData: this.textData(),
        ports: portsSerialized

    };
};


TextEditorData.prototype.setCoord = function(x,y) {

    this.x(x);
    this.y(y);
    this.container.x = x;
    this.container.y = y;


    return this;
};
