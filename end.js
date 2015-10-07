


var EndBlock = function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "End";
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
    this.canvasElement.setActiveElement();
};

EndBlock.prototype.fromJS = function(end) {
    this.id(end.id);
    this.type = end.type;
    this.name = end.name;
    this.portHandler.fromJS(end.portHandler);
    this.canvasElement.fromJS(end.canvasElement);
    return this;
};


EndBlock.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name,
        portHandler:this.portHandler.toJS(),
        canvasElement: this.canvasElement.toJS()
    };
};

