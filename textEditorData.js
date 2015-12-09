// � by Caspar Goeke and Holger Finger


var TextEditorData = function(expData) {

    this.expData = expData;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.id = ko.observable(guid());
    this.type = "TextEditorData";
    this.name = ko.observable("Text Editor");
    this.maxPresentationTime = ko.observable(null);
    this.isActive = ko.observable(false);

    // not serialized
    this.shape = "square";
    this.label = "Text";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.text = ko.observable('');
    this.portHandler = new PortHandler(this);
};


TextEditorData.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.textEditorData = this;
    page("/page/editors/textEditor");
};

TextEditorData.prototype.setPointers = function() {

};

TextEditorData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.text(data.text);
    return this;
};

TextEditorData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        portHandler:this.portHandler.toJS(),
        text: this.text()
    };
};

