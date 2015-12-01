// � by Caspar Goeke and Holger Finger


var MediaEditorData = function(expData) {


    var self = this;
    this.expData = expData;

    // serialized
    this.id = ko.observable(guid());
    this.type = "MediaEditorData";
    this.currSelectedElement = ko.observable(null);
    this.name = ko.observable("Media Editor");
    this.minPresentationTime = ko.observable(null);
    this.maxPresentationTime = ko.observable(null);


    // not serialized
    this.shape = "square";
    this.label = "MediaEditor";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observableArray([]).extend({sortById: null});
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);

};

MediaEditorData.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.mediaEditorData = this;
    page("/page/editors/mediaEditor");
};

MediaEditorData.prototype.setPointers = function() {
};

MediaEditorData.prototype.getElementById = function(id) {
    return  this.elements.byId[id];
};


MediaEditorData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;

    this.name(data.name);
    this.minPresentationTime(data.minPresentationTime);
    this.maxPresentationTime(data.maxPresentationTime);
    this.currSelectedElement(data.currSelectedElement);
    this.portHandler.fromJS(data.portHandler);
    this.canvasElement.fromJS(data.canvasElement);

    var elements = [];
    if (data.hasOwnProperty('elements')) {
        for (var i= 0, len=data.elements.length; i<len; i++) {
            if (data.elements[i].type == 'ImageData'){
                elements[i] = new ImageData(this);
            }
            elements[i].fromJS(data.elements[i]);
        }
    }
    this.elements(elements);

    return this;
};


MediaEditorData.prototype.toJS = function() {
    var elements = [];
    for (var i= 0, len=this.elements().length; i<len; i++) {
        elements.push(this.elements()[i].toJS());
    }

    return {
        id: this.id(),
        type: this.type,

        name:  this.name(),
        minPresentationTime: this.minPresentationTime(),
        maxPresentationTime: this.maxPresentationTime(),
        currSelectedElement: this.currSelectedElement(),
        portHandler:this.portHandler.toJS(),
        canvasElement: this.canvasElement.toJS(),
        elements: elements
    };
};


