
var VideoElement= function(expData) {

    this.expData = expData;
    this.parent = null;

    this.type = "VideoElement";
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


VideoElement.prototype.dataType =      [ "string", "string", "string"];
VideoElement.prototype.modifiableProp = ["name","file_id","file_orig_name"];

VideoElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

VideoElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

VideoElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

VideoElement.prototype.fromJS = function(data) {
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

VideoElement.prototype.toJS = function() {

    return {

        type: this.type,
        dataType: this.dataType,
        name: this.name(),
        file_id: this.file_id(),
        file_orig_name: this.file_orig_name(),
        modifier: this.modifier().toJS()

    };
};

