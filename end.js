


var EndBlock = function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "End";

    // not serialized
    this.shape = "circle";
    this.label = "End";
    this.portTypes = ["executeIn"];

    // sub-Structures (serialized below)
    this.canvasElement = new CanvasElement(this);
    this.portHandler = new PortHandler(this);

    // add Ports to Renderer
    this.canvasElement.addPorts(this.portHandler.ports());
};


EndBlock.prototype.setPointers = function() {

};

EndBlock.prototype.fromJS = function(end) {
    this.id(end.id);
    this.type = end.type;
    this.canvasElement.fromJS(end.canvasElement);
    this.portHandler.fromJS(end.portHandler);
    return this;
};


EndBlock.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        canvasElement: this.canvasElement.toJS(),
        portHandler:this.portHandler.toJS()
    };
};

