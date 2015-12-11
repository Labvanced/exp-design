// � by Caspar Goeke and Holger Finger


var VideoData= function(expData) {

    this.expData = expData;
    this.parent = null;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.id = ko.observable(guid());
    this.type = "VideoData";
    this.name = ko.observable("Video");
    this.onset = ko.observable(0);
    this.onsetEnabled = ko.observable(false);
    this.offset = ko.observable(0);
    this.offsetEnabled = ko.observable(false);
    this.responses = ko.observableArray([]);
    this.modifier = ko.observable(new Modifier(this.expData, this));
    this.file_id = ko.observable(null);
    this.file_orig_name = ko.observable(null);
    this.isActive = ko.observable(true);

    // not serialized
    this.shape = "square";
    this.label = "Video";
    this.vidSource = ko.computed( function() {
        if (this.file_id()) {
            return "/files/" + this.file_id() + "/" + this.file_orig_name();
        }
        else {
            return false
        }
    }, this);
};

VideoData.prototype.setPointers = function() {
    this.modifier().setPointers();
};


VideoData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.file_id(data.file_id);
    this.file_orig_name(data.file_orig_name);
    this.onset(data.onset);
    this.onsetEnabled(data.onsetEnabled);
    this.offset(data.offset);
    this.offsetEnabled(data.offsetEnabled);
    this.responses(jQuery.map( data.responses, function( respData ) {
        return (new Response()).loadJS(respData);
    } ));
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.isActive(data.isActive);
    return this;
};

VideoData.prototype.toJS = function() {

    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        file_id: this.file_id(),
        file_orig_name: this.file_orig_name(),
        onset: this.onset(),
        onsetEnabled: this.onsetEnabled(),
        offset: this.offset(),
        offsetEnabled: this.offsetEnabled(),
        responses: jQuery.map( this.responses(), function( resp ) { return resp.toJS(); } ),
        modifier: this.modifier().toJS(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        isActive:  this.isActive()
    };
};

