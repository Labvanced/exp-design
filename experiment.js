// � by Caspar Goeke and Holger Finger


var Experiment = function () {
    this.exp_id = ko.observable(0);
    this.exp_series_id = ko.observable(0);
    this.exp_name = ko.observable('');
    this.version = ko.observable(1);
    this.is_editing = ko.observable(true);
    this.is_recording = ko.observable(false);
    this.is_published = ko.observable(false);
    this.img_file_id = ko.observable(null);
    this.img_file_orig_name = ko.observable(null);
    this.description = ko.observable(0);
    this.category_id = ko.observable(0);
    this.exp_data = new ExpData();
};


Experiment.prototype.setPointers = function() {
    this.exp_data.setPointers();
};

Experiment.prototype.fromJS = function(data) {
    this.exp_id = ko.observable(data.exp_id);
    this.exp_series_id = ko.observable(data.exp_series_id);
    this.exp_name = ko.observable(data.exp_name);
    this.version = ko.observable(data.version);
    this.is_editing = ko.observable(data.is_editing);
    this.is_recording = ko.observable(data.is_recording);
    this.is_published = ko.observable(data.is_published);
    this.description = ko.observable(data.description);
    this.category_id = ko.observable(data.category_id);
    this.img_file_id = ko.observable(data.img_file_id);
    this.img_file_orig_name = ko.observable(data.img_file_orig_name);
    if (data.hasOwnProperty("exp_data")){
        this.exp_data = new ExpData();
        this.exp_data.fromJS(data.exp_data);
    }
    else {
        this.exp_data = "not loaded";
    }
    return this;
};

Experiment.prototype.editExp = function() {
    page("/page/editors/mainExperimentPage/"+this.exp_id());
};

Experiment.prototype.publish = function() {
    page("/page/publishExperiment/"+this.exp_id());
};

Experiment.prototype.unpublish = function() {
    this.is_published(false);
    this.save();
};

Experiment.prototype.finishEditing = function() {
    this.is_editing(false);
    this.save();
};

Experiment.prototype.toJS = function() {

    if (this.exp_data instanceof ExpData){
        var exp_data_serialized = this.exp_data.toJS();
    }
    else {
        var exp_data_serialized = null;
    }

    return {
        exp_id: this.exp_id(),
        exp_series_id: this.exp_series_id(),
        exp_name: this.exp_name(),
        version: this.version(),
        is_editing: this.is_editing(),
        is_recording: this.is_recording(),
        is_published: this.is_published(),
        description: this.description(),
        category_id: this.category_id(),
        img_file_id: this.img_file_id(),
        img_file_orig_name: this.img_file_orig_name(),
        exp_data: exp_data_serialized
    };
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