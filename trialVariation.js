/**
 * A variation of a condition
 * @param condition
 * @constructor
 */
var TrialVariation= function(condition) {
    this.condition = condition;

    // not serialized:
    this.nr = ko.observable(0);

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TrialVariation}
 */
TrialVariation.prototype.fromJS= function(data) {
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TrialVariation.prototype.toJS= function() {
    return {};
};