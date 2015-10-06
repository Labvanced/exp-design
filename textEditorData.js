


var TextEditorData = function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "TextEditorData";

    // not serialized
    this.shape = "square";
    this.label = "Text";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observable('');
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);

    // set current Element as selected Element of parent
    if (parentSequence){
        this.parentSequence.currSelectedElement(this.id());
    }
};


TextEditorData.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.textEditorData = this;
    page("/page/textEditor");
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

