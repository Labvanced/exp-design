var PasswordRequest = function(publishing_data) {
    var self = this;

    this.publishing_data = publishing_data;

    this.imageType = ko.observable(publishing_data.imageType());
    this.exp_name = ko.observable(publishing_data.exp_name());
    this.jdenticonHash = ko.observable(publishing_data.jdenticonHash());
    this.description = ko.observable(publishing_data.description());
    this.displayBackToLib = publishing_data.displayBackToLib;

    this.password = ko.observable("");

    this.imgSource = ko.computed( function() {
        return "/files/" + publishing_data.img_file_id() + "/" + publishing_data.img_file_orig_name();
    }, this);


    this.callback = null;

};

PasswordRequest.prototype.init = function(callback) {
    this.callback = callback;
};


PasswordRequest.prototype.submitPassword = function() {
    this.callback(this.password());
};