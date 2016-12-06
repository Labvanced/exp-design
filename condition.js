
/**
 * This class stores a condition with the associated factors and levels
 *
 * @constructor
 */
var Condition = function(factorGroup) {
    this.factorGroup = factorGroup;

    // serialized
    this.trials = ko.observableArray([]);

    // not serialized
    this.factorLevels = ko.observableArray([]); // level_obj1, level_ob2
    this.trialStartIdx = ko.observable(0);
    this.conditionIdx = ko.observable();

};

/**
 * Initializes a new instance with just one trial variation. This function is usually called after the constructor
 * created a new instance.
 */
Condition.prototype.initNewInstance = function() {
    this.addTrial();
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Condition.prototype.setPointers = function(entitiesArr) {

};

/**
 * This function sets the number of trials in this condition to a specified value.
 * @param {number} numTrialVariations - The new total number of trials in this condition.
 */
Condition.prototype.setNumTrials = function (numTrialVariations) {
    var trialVariations = this.trials();
    var currentLength = trialVariations.length;
    var lengthToBe = numTrialVariations;
    var diff, i;
    if (currentLength > lengthToBe) {
        diff = currentLength - lengthToBe;
        for (i = 0; i < diff; i++) {
            this.removeTrialVariation();
        }
        this.trials(trialVariations);
    }
    else if (currentLength < lengthToBe) {
        diff = lengthToBe - currentLength;
        for (i = 0; i < diff; i++) {
            this.addTrial();
        }
    }
};

/**
 * adds a new trial to this condition.
 */
Condition.prototype.addTrial = function() {

    var trialVariations = new TrialVariation(this);
    trialVariations.nr(this.trials().length);
    this.trials.push(trialVariations);
};

/**
 * removes the last trial from this condition.
 */
Condition.prototype.removeTrialVariation = function() {

    this.trials.pop();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Condition}
 */
Condition.prototype.fromJS = function(data) {

    var self = this;

    this.trials(jQuery.map(data.trials, function (trial, index) {
        var trialVariation = new TrialVariation(self);
        trialVariation.fromJS(trial);
        trialVariation.nr(index);
        return trialVariation;
    }));

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {{trials: *}}
 */
Condition.prototype.toJS = function() {
    return {
        trials: jQuery.map( this.trials(), function(trial ) { return trial.toJS(); })
    };
};

