


var ImageData= function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "ImageData";

    // not serialized
    this.shape = "square";
    this.label = "Image";
    this.gridSpaceInPixels = 25;

    // sub-Structures (serialized below)
    this.canvasElement = new CanvasElement(this);
};



ImageData.prototype.setPointers = function() {

};


ImageData.prototype.fromJS = function(image) {
    this.id(image.id);
    this.type = image.type;
    this.canvasElement.fromJS(image.canvasElement);
    return this;
};

ImageData.prototype.toJS = function() {

    return {
        id: this.id(),
        type: this.type,
        canvasElement: this.canvasElement.toJS()
    };
};

