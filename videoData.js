// � by Caspar Goeke and Holger Finger


var VideoData= function(expData) {

    this.expData = expData;

    // serialized
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

    // sub-Structures (serialized below)
    this.canvasElement = new CanvasElement(this);
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
    this.responses(jQuery.map( data.responses, function( respData ) {
        return (new Response()).loadJS(respData);
    } ));
    this.canvasElement.fromJS(data.canvasElement);
    return this;
};

VideoData.prototype.toJS = function() {

    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        responses: jQuery.map( this.responses(), function( resp ) { return resp.toJS(); } ),
        canvasElement: this.canvasElement.toJS()
    };
};

