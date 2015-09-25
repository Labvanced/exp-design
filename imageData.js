


var ImageData= function(parentSequence) {

    var self = this;
    this.parentSequence = parentSequence;
    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.id = ko.observable(guid());
    this.container = new createjs.Container();
    var rect = new createjs.Shape();
    rect.graphics.beginStroke("black").beginFill("gray").drawRect(-100, -50, 200, 100);
    rect.addEventListener("pressmove", function (ev) {
        var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
        self.setCoord(mouseAt.x, mouseAt.y);
    });
    var self = this;
    rect.addEventListener("dblclick", function (ev) {
       // how properties, not yet implemented
    });
    this.container.addChild(rect);

    var txt = new createjs.Text("Image", "16px Arial", "#FFF");
    txt.textAlign = 'center';
    this.container.addChild(txt);

    self.setCoord(550, 300);

};



ImageData.prototype.setPointers = function() {

};


ImageData.prototype.fromJS = function(textBlock) {
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


ImageData.prototype.toJS = function() {
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


ImageData.prototype.setCoord = function(x,y) {

    this.x(x);
    this.y(y);
    this.container.x = x;
    this.container.y = y;


    return this;
};
