// © by Caspar Goeke and Holger Finger


var StartBlock = function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Start";

    // not serialized
    this.shape = "circle";
    this.label = "Start";
    this.portTypes = ["executeOut"];
    this.name = ko.observable("Start");

    // sub-Structures (serialized below)
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);
};


StartBlock.prototype.setPointers = function() {
    this.canvasElement.setActiveElement();
};


StartBlock.prototype.fromJS = function(start) {
    this.id(start.id);
    this.type = start.type;

    this.name(start.name);
    this.portHandler.fromJS(start.portHandler);
    this.canvasElement.fromJS(start.canvasElement);
    return this;
};


StartBlock.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,

        name: this.name(),
        portHandler:this.portHandler.toJS(),
        canvasElement: this.canvasElement.toJS()
    };
};
