/**
 * A variation of a condition
 * @param condition
 * @constructor
 */
var TrialVariation = function (condition) {
    var self = this;
    this.condition = condition;

    // not serialized:
    this.nr = ko.observable(0);
    this.trialIdx = ko.observable(0);


    this.uniqueId = ko.computed(function () {
        var offset = condition.factorGroup.trialOffset();
        return self.condition.trialStartIdx() + self.nr() + offset;
    }, this);

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TrialVariation}
 */
TrialVariation.prototype.fromJS = function (data) {
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TrialVariation.prototype.toJS = function () {
    return {};
};