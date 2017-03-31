
var AudioElement= function(expData) {

    var self = this;
    this.expData = expData;
    this.parent = null;

    this.type = "AudioElement";
    this.name = ko.observable("Audio");

    this.file_id = ko.observable(null);
    this.file_orig_name = ko.observable(null);
    this.showMediaControls = ko.observable(true);

    this.currentlyPlaying = ko.observable(false); // not serialized at the moment... maybe later?

    this.shortName = ko.computed(function() {
        if (self.file_orig_name()){
            return (self.file_orig_name().length > 10 ? self.file_orig_name().substring(0, 9) + '...' : self.file_orig_name());
        }
        else return '';

    });


    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
    
    this.label = "Audio";

    this.audioSource = ko.computed( function() {
        if (this.modifier().selectedTrialView.file_id() && this.modifier().selectedTrialView.file_orig_name()) {
            return "/files/" + this.modifier().selectedTrialView.file_id() + "/" + this.modifier().selectedTrialView.file_orig_name();
        }
        else {
            return false;
        }
    }, this);
};


AudioElement.prototype.dataType =      [ "string", "string", "string"];
AudioElement.prototype.modifiableProp = ["name","file_id","file_orig_name"];

AudioElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

AudioElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

AudioElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

AudioElement.prototype.fromJS = function(data) {
    var self = this;
    this.type = data.type;
    this.dataType = data.dataType;
    this.name(data.name);
    this.file_id(data.file_id);
    this.file_orig_name(data.file_orig_name);
    if (data.hasOwnProperty('showMediaControls')) {
        this.showMediaControls(data.showMediaControls);
    }
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);

    return this;
};

AudioElement.prototype.toJS = function() {

    return {

        type: this.type,
        dataType: this.dataType,
        name: this.name(),
        file_id: this.file_id(),
        file_orig_name: this.file_orig_name(),
        showMediaControls: this.showMediaControls(),
        modifier: this.modifier().toJS()

    };
};

/**
 * Created by cgoeke on 28.02.2017.
 */
