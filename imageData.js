


var ImageData= function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "ImageData";

    // not serialized
    this.shape = "square";
    this.label = "Image";
    this.name = ko.observable();


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

    // set current Element as selected Element of parent
    if (parentSequence){
        this.parentSequence.currSelectedElement(this.id());
    }
};





ImageData.prototype.setPointers = function() {

};

ImageData.prototype.createImageInstance = function() {
    this.canvasElement.replaceWithImage(this.imgSource());
};


ImageData.prototype.fromJS = function(image) {
    this.id(image.id);
    this.type = image.type;
    this.name = image.name;
    this.canvasElement.fromJS(image.canvasElement);
    return this;
};

ImageData.prototype.toJS = function() {

    return {
        id: this.id(),
        type: this.type,
        name: this.name,
        canvasElement: this.canvasElement.toJS()
    };
};

