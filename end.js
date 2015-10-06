


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
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);

    // set current Element as selected Element of parent
    if (parentSequence){
        this.parentSequence.currSelectedElement(this.id());
    }

};


EndBlock.prototype.setPointers = function() {

};

EndBlock.prototype.fromJS = function(end) {
    this.id(end.id);
    this.type = end.type;
    this.portHandler.fromJS(end.portHandler);
    this.canvasElement.fromJS(end.canvasElement);
    return this;
};


EndBlock.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        portHandler:this.portHandler.toJS(),
        canvasElement: this.canvasElement.toJS()
    };
};

