


var TextEditorData = function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "TextEditorData";
    this.name = ko.observable("Text Editor");

    // not serialized
    this.shape = "square";
    this.label = "Text";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observable('');
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);
};


TextEditorData.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.textEditorData = this;
    page("/page/textEditor");
};

TextEditorData.prototype.setPointers = function() {
    this.canvasElement.setActiveElement();
};


TextEditorData.prototype.fromJS = function(textData) {
    this.id(start.id);
    this.type = textData.type;
    this.name(textData.name);
    this.canvasElement.fromJS(start.canvasElement);
    this.portHandler.fromJS(start.portHandler);
    this.elements(textData.elements);
    return this;

};


TextEditorData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,

        name: this.name(),
        canvasElement: this.canvasElement.toJS(),
        portHandler:this.portHandler.toJS(),
        elements: this.elements()
    };
};

