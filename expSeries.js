// � by Caspar Goeke and Holger Finger

/**
 * Stores a series of experiments. These series are usually just different versions of the same experiment.
 *
 * @constructor
 */
var ExpSeries = function () {
    this.exp_series_id = ko.observable(0);
    this.user_id = ko.observable(0);
    this.exp_series_name = ko.observable("");
    this.experiments = ko.observableArray();
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpSeries.prototype.setPointers = function() {
    this.experiments.each.setPointers();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ExpSeries}
 */
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

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ExpSeries.prototype.toJS = function() {
    return {
        exp_series_id: this.exp_series_id(),
        user_id: this.user_id(),
        exp_series_name: this.exp_series_name(),
        experiments: jQuery.map( this.experiments(), function( experiment ) { return experiment.toJS() } )
    };
};
