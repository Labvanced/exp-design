// � by Caspar Goeke and Holger Finger

var ExpSeries = function () {
    this.exp_series_id = ko.observable(0);
    this.user_id = ko.observable(0);
    this.exp_series_name = ko.observable("");
    this.experiments = ko.observableArray();
};

ExpSeries.prototype.setPointers = function() {
    this.experiments.each.setPointers();
};

ExpSeries.prototype.fromJS = function(data) {
    this.exp_series_id = ko.observable(data.exp_series_id);
    this.user_id = ko.observable(data.user_id);
    this.exp_series_name = ko.observable(data.exp_series_name);
    if (data.hasOwnProperty("experiments")){
        this.experiments(jQuery.map( data.experiments, function( experiment ) { return new Experiment().fromJS(experiment) }));
    }
    else {
        this.experiments([]);
    }
    return this;
};

ExpSeries.prototype.toJS = function() {
    return {
        exp_series_id: this.exp_series_id(),
        user_id: this.user_id(),
        exp_series_name: this.exp_series_name(),
        experiments: jQuery.map( this.experiments(), function( experiment ) { return experiment.toJS() } )
    };
};
