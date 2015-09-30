


var TextEditorData = function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "TextEditorData";

    // not serialized
    this.shape = "square";
    this.label = "Text-Editor";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observable('');
    this.canvasElement = new CanvasElement(this);
    this.portHandler = new PortHandler(this);

    // add Ports to Renderer
    this.canvasElement.addPorts(this.portHandler.ports());
};



TextEditorData.prototype.setPointers = function() {

};


TextEditorData.prototype.fromJS = function(textData) {
    this.id(start.id);
    this.type = textData.type;
    this.canvasElement.fromJS(start.canvasElement);
    this.portHandler.fromJS(start.portHandler);
    this.elements(textData.elements);
    return this;

};


TextEditorData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        canvasElement: this.canvasElement.toJS(),
        portHandler:this.portHandler.toJS(),
        elements: this.elements()
    };
};

