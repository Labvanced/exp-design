// � by Caspar Goeke and Holger Finger


var VideoData= function(expData) {

    this.expData = expData;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.id = ko.observable(guid());
    this.type = "VideoData";
    this.name = ko.observable("Video");
    this.responses = ko.observableArray([]);

    // not serialized
    this.shape = "square";
    this.label = "Video";

    this.vid_file_id = ko.observable(null);
    this.vid_file_orig_name = ko.observable(null);
    this.vidSource = ko.computed( function() {
        if (this.vid_file_id()) {
            return "/files/" + this.vid_file_id() + "/" + this.vid_file_orig_name();
        }
        else {
            return false
        }
    }, this);
};

VideoData.prototype.setPointers = function() {
};

VideoData.prototype.createImageInstance = function() {
    //this.canvasElement.replaceWithImage(this.vidSource());
};


VideoData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.vid_file_id(data.vid_file_id);
    this.vid_file_orig_name(data.vid_file_orig_name);
    this.responses(jQuery.map( data.responses, function( respData ) {
        return (new Response()).loadJS(respData);
    } ));
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    return this;
};

VideoData.prototype.toJS = function() {

    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        vid_file_id: this.vid_file_id(),
        vid_file_orig_name: this.vid_file_orig_name(),
        responses: jQuery.map( this.responses(), function( resp ) { return resp.toJS(); } ),
        editorX:  this.editorX(),
        editorY:  this.editorY()
    };
};

