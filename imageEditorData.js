


var ImageEditorData = function(parentSequence) {


    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "ImageEditorData";
    this.currSelectedElement = ko.observable(0);

    // not serialized
    this.shape = "square";
    this.label = "Image-Editor";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observableArray([]);
    this.canvasElement = new CanvasElement(this);
    this.portHandler = new PortHandler(this);

    // add Ports to Renderer
    this.canvasElement.addPorts(this.portHandler.ports());
};



ImageEditorData.prototype.setPointers = function() {

};


ImageEditorData.prototype.fromJS = function(editorData) {
    this.id(editorData.id);
    this.type = editorData.type;
    this.currSelectedElement(editorData.currSelectedElement);
    this.canvasElement.fromJS(editorData);
    this.portHandler.fromJS(editorData.canvasElement);

    var elements = [];
    if (editorData.hasOwnProperty('elements')) {
        for (var i= 0, len=editorData.elements.length; i<len; i++) {
            if (editorData.elements[i].type == 'ImageData'){
                elements[i] = new ImageData(this);
            }
            elements[i].fromJS(editorData.elements[i]);
        }
    }
    this.elements(elements);

    return this;
};


ImageEditorData.prototype.toJS = function() {
    var elements = [];
    for (var i= 0, len=this.elements().length; i<len; i++) {
        elements.push(this.elements()[i].toJS());
    }

    return {
        id: this.id(),
        type: this.type,
        currSelectedElement: this.currSelectedElement(),
        canvasElement: this.canvasElement.toJS(),
        portHandler:this.portHandler.toJS(),
        elements: elements
    };
};


