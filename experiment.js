// � by Caspar Goeke and Holger Finger

/**
 * This class stores the exp_data together with all meta states
 * @constructor
 */
var Experiment = function () {
    this.exp_id = ko.observable(0);
    this.guid = ko.observable(guid());
    this.exp_series_id = ko.observable(0);
    this.exp_name = ko.observable('');
    this.version = ko.observable(1);
    this.is_editing = ko.observable(true);
    this.is_recording = ko.observable(false);
    this.is_analyzing = ko.observable(false);
    this.is_published = ko.observable(false);
    this.img_file_id = ko.observable(null);
    this.img_file_orig_name = ko.observable(null);
    this.description = ko.observable("");
    this.category_id = ko.observable(0);
    this.exp_data = new ExpData();
    this.exp_data_obs = ko.observable(this.exp_data);
};

Experiment.prototype.editExp = function() {
    page("/page/editors/experimentView/"+this.exp_id());
  //  page("/page/editors/mainExperimentPage/"+this.exp_id());
};

Experiment.prototype.viewRecordings = function() {
    page("/page/recordingsPage/"+this.exp_id());
};

Experiment.prototype.copyExp = function() {

};

Experiment.prototype.publish = function() {
    uc.experiment = this;
    page("/page/publishExperiment/"+this.exp_id());
};

Experiment.prototype.unpublish = function() {
    this.is_published(false);
    this.save();
};


Experiment.prototype.enableRec = function() {
    this.is_recording(true);
    this.save();
};


Experiment.prototype.stopRec = function() {
    this.is_recording(false);
    this.is_published(false);
    this.save();
};

Experiment.prototype.finishEditing = function() {
    this.is_editing(false);
    this.is_recording(true);
    this.save();
};

Experiment.prototype.save = function() {
    console.log("update experiment " + this.exp_name());
    var serializedExp = this.toJS();
    uc.socket.emit('updateExperiment', serializedExp, function(response){
        if (response.success){
            console.log("saved experiment success");
        }
        else {
            console.log("error: could not save experiment.")
        }
    });
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Experiment.prototype.setPointers = function() {
    if (this.exp_data instanceof ExpData) {
        this.exp_data.setPointers();
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Experiment}
 */
Experiment.prototype.fromJS = function(data) {
    this.guid(data.guid);
    this.exp_id(data.exp_id);
    this.exp_series_id(data.exp_series_id);
    this.exp_name(data.exp_name);
    this.version(data.version);
    this.is_editing(data.is_editing);
    this.is_recording(data.is_recording);
    this.is_analyzing(data.is_analyzing);
    this.is_published(data.is_published);
    this.description(data.description);
    this.category_id(data.category_id);
    this.img_file_id(data.img_file_id);
    this.img_file_orig_name(data.img_file_orig_name);
    if (data.hasOwnProperty("exp_data")){
        this.exp_data = new ExpData();
        this.exp_data.fromJS(data.exp_data);
    }
    else {
        this.exp_data = "not loaded";
    }
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
Experiment.prototype.toJS = function() {

    if (this.exp_data instanceof ExpData){
        var exp_data_serialized = this.exp_data.toJS();
    }
    else {
        var exp_data_serialized = null;
    }

    return {
        guid: this.guid(),
        exp_id: this.exp_id(),
        exp_series_id: this.exp_series_id(),
        exp_name: this.exp_name(),
        version: this.version(),
        is_editing: this.is_editing(),
        is_recording: this.is_recording(),
        is_analyzing: this.is_analyzing(),
        is_published: this.is_published(),
        description: this.description(),
        category_id: this.category_id(),
        img_file_id: this.img_file_id(),
        img_file_orig_name: this.img_file_orig_name(),
        exp_data: exp_data_serialized
    };
};
