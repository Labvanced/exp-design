var PublishingData = function(experiment,exp_data) {

    this.experiment = experiment;
    this.exp_data = exp_data;


    this.exp_name = ko.observable(experiment.exp_name());
    this.description = ko.observable(experiment.description());
    this.category_id = ko.observable(experiment.category_id());
    this.img_file_id = ko.observable(experiment.img_file_id());
    this.img_file_orig_name = ko.observable(experiment.img_file_orig_name());

    this.termsAccepted = ko.observable(false);
    this.copyrightsOk = ko.observable(false);

    this.publishInLibrary = ko.observable(true);
    this.publishSecretly = ko.observable(false);
    this.publishExternal= ko.observable(false);

    this.categories = ko.observable();

    this.brandingType= ko.observable('LabVanced');
    this.secrecyType= ko.observable('link');
    this.passwordType= ko.observable('oneForAll');

};