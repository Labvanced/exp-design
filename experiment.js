// � by Caspar Goeke and Holger Finger


var Experiment = function () {
    this.exp_id = ko.observable(0);
    this.user_id = ko.observable(0);
    this.exp_name = ko.observable('');
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
    this.user_id = ko.observable(data.user_id);
    this.exp_name = ko.observable(data.exp_name);
    this.description = ko.observable(data.description);
    this.category_id = ko.observable(data.category_id);
    this.img_file_id = ko.observable(data.img_file_id);
    this.img_file_orig_name = ko.observable(data.img_file_orig_name);
    this.exp_data = new ExpData();
    this.exp_data.fromJS(data.exp_data);
    return this;
};


Experiment.prototype.editExp = function() {
    uc.experiment = this;
    uc.currentEditorData = this.exp_data;
    //page("/page/editors/experimenteditor/"+this.exp_id());
    page("/page/editors/mainExperimentPage/"+this.exp_id());
};


Experiment.prototype.toJS = function() {
    return {
        exp_id: this.exp_id(),
        user_id: this.user_id(),
        exp_name: this.exp_name(),
        description: this.description(),
        category_id: this.category_id(),
        img_file_id: this.img_file_id(),
        img_file_orig_name: this.img_file_orig_name(),
        exp_data: this.exp_data.toJS()
    };
};

Experiment.prototype.save = function() {
    console.log("update experiment " + this.exp_name());
    var serializedExp = this.toJS();
    uc.socket.emit('updateExperiment', serializedExp);
};