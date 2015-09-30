


var StartBlock = function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Start";

    // not serialized
    this.shape = "circle";
    this.label = "Start";
    this.portTypes = ["executeOut"];

    // sub-Structures (serialized below)
    this.canvasElement = new CanvasElement(this);
    this.portHandler = new PortHandler(this);

    // add Ports to Renderer
    this.canvasElement.addPorts(this.portHandler.ports());
};


StartBlock.prototype.setPointers = function() {

};


StartBlock.prototype.fromJS = function(start) {
    this.id(start.id);
    this.type = start.type;
    this.canvasElement.fromJS(start.canvasElement);
    this.portHandler.fromJS(start.portHandler);
    return this;
};


StartBlock.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        canvasElement: this.canvasElement.toJS(),
        portHandler:this.portHandler.toJS()
    };
};
