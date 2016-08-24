// � by Caspar Goeke and Holger Finger


var ImageData= function(expData) {

    this.expData = expData;
    this.parent = null;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.editorWidth = ko.observable(120);
    this.editorHeight = ko.observable(60);
    this.stretchImageToFitBoundingBox = ko.observable(false);
    this.id = ko.observable(guid());
    this.type = "ImageData";
    this.name = ko.observable("Image");
    this.onset = ko.observable(0);
    this.onsetEnabled = ko.observable(false);
    this.keepAspectRatio = ko.observable(false);
    this.offset = ko.observable(0);
    this.offsetEnabled = ko.observable(false);
    this.responses = ko.observableArray([]);
    this.file_id = ko.observable(null);
    this.file_orig_name = ko.observable(null);
    this.isActive = ko.observable(true);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    // not serialized
    this.shape = "square";
    this.label = "Image";
    this.imgSource = ko.computed( function() {
        if (this.modifier().selectedTrialView.file_id() && this.modifier().selectedTrialView.file_orig_name()) {
            return "/files/" + this.modifier().selectedTrialView.file_id() + "/" + this.modifier().selectedTrialView.file_orig_name();
        }
        else {
            return false
        }
    }, this);

};


ImageData.prototype.eventPropChange = [ true, true, true,true,false,false,false,false,false,false,false,false,false,false];
ImageData.prototype.modifiableProp = ["editorX", "editorY", "editorWidth","editorHeight","name","onset","onsetEnabled","offset","offsetEnabled","file_id","file_orig_name","isActive","keepAspectRatio","stretchImageToFitBoundingBox"];

ImageData.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);

    jQuery.each( this.responses(), function( idx, resp ) {
        resp.setPointers(entitiesArr);
    } );
};

ImageData.prototype.addNewResponse = function() {
    var resp = new Response(this);
    resp.responseType("mouse");
    this.responses.push(resp);
};

ImageData.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};


ImageData.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

ImageData.prototype.fromJS = function(data) {
    var self = this;
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
        return (new Response(self)).fromJS(respData);
    } ));
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    this.isActive(data.isActive);
    this.keepAspectRatio(data.keepAspectRatio);
    if (data.stretchImageToFitBoundingBox) {
        this.stretchImageToFitBoundingBox(data.stretchImageToFitBoundingBox);
    }
    return this;
};

ImageData.prototype.toJS = function() {

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
        editorWidth: this.editorWidth(),
        editorHeight: this.editorHeight(),
        isActive:  this.isActive(),
        stretchImageToFitBoundingBox: this.stretchImageToFitBoundingBox(),
        keepAspectRatio: this.keepAspectRatio()
    };
};

