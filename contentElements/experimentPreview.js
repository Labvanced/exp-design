/**
 * Created by cgoeke on 23.02.2017.
 */


var ExperimentPreview= function(experiment) {
    this.imageType = ko.observable(experiment.publishing_data.imageType());
    this.exp_name = ko.observable(experiment.publishing_data.exp_name());
    this.jdenticonHash = ko.observable(experiment.publishing_data.jdenticonHash());
    this.description = ko.observable(experiment.publishing_data.description());
   
};



ExperimentPreview.prototype.init = function() {
    jdenticon();
    jdenticon.update("#identicon", this.jdenticonHash());
};
