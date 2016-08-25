// � by Caspar Goeke and Holger Finger


var VideoData= function(expData) {

    this.expData = expData;
    this.parent = null;

    this.type = "VideoData";
    this.name = ko.observable("Video");

    this.file_id = ko.observable(null);
    this.file_orig_name = ko.observable(null);


    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    // not serialized
    this.shape = "square";
    this.label = "Video";

    this.vidSource = ko.computed( function() {
        if (this.modifier().selectedTrialView.file_id() && this.modifier().selectedTrialView.file_orig_name()) {
            return "/files/" + this.modifier().selectedTrialView.file_id() + "/" + this.modifier().selectedTrialView.file_orig_name();
        }
        else {
            return false
        }
    }, this);
};


VideoData.prototype.dataType =      [ "string", "string", "string"];
VideoData.prototype.modifiableProp = ["name","file_id","file_orig_name"];

VideoData.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

VideoData.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

VideoData.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

VideoData.prototype.fromJS = function(data) {
    var self = this;
    this.type = data.type;
    this.dataType = data.dataType;
    this.name(data.name);
    this.file_id(data.file_id);
    this.file_orig_name(data.file_orig_name);


    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);

    return this;
};

VideoData.prototype.toJS = function() {

    return {

        type: this.type,
        dataType: this.dataType,
        name: this.name(),
        file_id: this.file_id(),
        file_orig_name: this.file_orig_name(),
        modifier: this.modifier().toJS()

    };
};

