


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
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);

    // set current Element as selected Element of parent
    if (parentSequence){
        this.parentSequence.currSelectedElement(this.id());
    }

};


StartBlock.prototype.setPointers = function() {

};


StartBlock.prototype.fromJS = function(start) {
    this.id(start.id);
    this.type = start.type;
    this.portHandler.fromJS(start.portHandler);
    this.canvasElement.fromJS(start.canvasElement);
    return this;
};


StartBlock.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        portHandler:this.portHandler.toJS(),
        canvasElement: this.canvasElement.toJS()
    };
};
