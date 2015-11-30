// � by Caspar Goeke and Holger Finger


var ImageData= function(expData) {

    this.expData = expData;

    // serialized
    this.id = ko.observable(guid());
    this.type = "ImageData";
    this.name = ko.observable("Image");

    this.stimulusOnset = ko.observable(null);
    this.stimulusOffset = ko.observable(null);
    this.keybordExitResponses = ko.observableArray(null);
    this.mouseExitResponse = ko.observable(false);


    // not serialized
    this.shape = "square";
    this.label = "Image";


    this.img_file_id = ko.observable(null);
    this.img_file_orig_name = ko.observable(null);
    this.imgSource = ko.computed( function() {
        if (this.img_file_id()) {
            return "/files/" + this.img_file_id() + "/" + this.img_file_orig_name();
        }
        else {
            return false
        }
    }, this);

    // sub-Structures (serialized below)
    this.canvasElement = new CanvasElement(this);

};





ImageData.prototype.setPointers = function() {
    this.canvasElement.setActiveElement();
};

ImageData.prototype.createImageInstance = function() {
    this.canvasElement.replaceWithImage(this.imgSource());
};


ImageData.prototype.fromJS = function(image) {
    this.id(image.id);
    this.type = image.type;

    this.name(image.name);
    this.stimulusOnset(image.stimulusOnset);
    this.stimulusOffset(image.stimulusOffset);
    this.keybordExitResponses(image.keybordExitResponses);
    this.mouseExitResponse(image.mouseExitResponse);
    this.canvasElement.fromJS(image.canvasElement);
    return this;
};

ImageData.prototype.toJS = function() {

    return {
        id: this.id(),
        type: this.type,

        name: this.name(),
        minPresentationTime: this.minPresentationTime(),
        maxPresentationTime: this.maxPresentationTime(),
        keybordExitResponses: this.keybordExitResponses(),
        mouseExitResponse: this.mouseExitResponse(),
        canvasElement: this.canvasElement.toJS()
    };
};

