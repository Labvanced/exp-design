// � by Caspar Goeke and Holger Finger


var EndBlock = function(expData) {

    this.expData = expData;

    // serialized
    this.id = ko.observable(guid());
    this.type = "EndBlock";
    this.name = ko.observable("End");

    // not serialized
    this.shape = "circle";
    this.label = "End";
    this.portTypes = ["executeIn"];



    // sub-Structures (serialized below)
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);

};


EndBlock.prototype.setPointers = function() {

};

EndBlock.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.canvasElement.fromJS(data.canvasElement);
    return this;
};


EndBlock.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        portHandler:this.portHandler.toJS(),
        canvasElement: this.canvasElement.toJS()
    };
};

