


var ImageData= function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "ImageData";

    // not serialized
    this.shape = "square";
    this.label = "Image";


    // from new exp panel
    this.uploader = {
        filename: ko.observable(''),
        percent: ko.observable(0),
        mbUploaded: ko.observable(0),
        mbTotal: ko.observable(0),
        imgFile: ko.observable(''),
        selectedFile: null
    };

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
    //



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

