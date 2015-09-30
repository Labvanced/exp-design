


var ImageData= function(parentSequence) {

    var self = this;
    this.parentSequence = parentSequence;
    this.type = "ImageData";
    this.id = ko.observable(guid());
    this.container = new createjs.Container();
    var rect = new createjs.Shape();
    this.gridSpaceInPixels = 25;

    this.canvasElement = new CanvasElement(this);

};



ImageData.prototype.setPointers = function() {

};


ImageData.prototype.fromJS = function(textBlock) {
    this.id(textBlock.id);
    this.canvasElement.fromJS(textBlock);
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
        canvasElement: this.canvasElement.toJS(),
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
