// � by Caspar Goeke and Holger Finger


var ImageData= function(expData) {

    this.expData = expData;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.id = ko.observable(guid());
    this.type = "ImageData";
    this.name = ko.observable("Image");
    this.imageOnset = ko.observable(null);
    this.imageOffset = ko.observable(null);
    this.responses = ko.observableArray([]);

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
};

ImageData.prototype.createImageInstance = function() {
    this.canvasElement.replaceWithImage(this.imgSource());
};


ImageData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.img_file_id(data.img_file_id);
    this.img_file_orig_name(data.img_file_orig_name);
    this.imageOnset(data.imageOnset);
    this.imageOffset(data.imageOffset);
    this.responses(jQuery.map( data.responses, function( respData ) {
        return (new Response()).loadJS(respData);
    } ));
    this.editorX(data.editorX);
    this.editorY(data.editorX);
    return this;
};

ImageData.prototype.toJS = function() {

    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        img_file_id: this.img_file_id(),
        img_file_orig_name: this.img_file_orig_name(),
        imageOnset: this.imageOnset(),
        imageOffset: this.imageOffset(),
        responses: jQuery.map( this.responses(), function( resp ) { return resp.toJS(); } ),
        editorX:  this.editorX(),
        editorY:  this.editorY()
    };
};

