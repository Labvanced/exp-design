// � by Caspar Goeke and Holger Finger


var TextEditorData = function(expData) {

    this.expData = expData;
    this.parent = null;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.editorWidth = ko.observable(120);
    this.editorHeight = ko.observable(60);
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
    this.text = ko.observable('<p style="text-align: center;"></p>');
    this.portHandler = new PortHandler(this);
};


TextEditorData.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.textEditorData = this;
    page("/page/editors/textEditor");
};

TextEditorData.prototype.setPointers = function(entitiesArr) {

};

TextEditorData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    this.isActive(data.isActive);
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
        editorWidth: this.editorWidth(),
        editorHeight: this.editorHeight(),
        isActive:  this.isActive(),
        portHandler:this.portHandler.toJS(),
        text: this.text()
    };
};

