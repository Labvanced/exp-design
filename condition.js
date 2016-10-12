/**
 * Created by cgoeke on 10/6/16.
 */


var Condition= function(expData) {

    // serialized

    this.expData = expData;
    this.nrOfRepetitions = ko.observable(1);

    // not serialized
    this.factorLevels = ko.observableArray([]); // 0, 1
    this.factorNames = ko.observableArray([]); // 'factor1', 'factor2'
    this.factorLevelNames = ko.observableArray([]); // 'factor1_level1', 'factor2_level1'
    this.repetitionStartIdx= null;

    this.conditionIdx = null;
    this.repetitions = [];

};





Condition.prototype.setRepetitions = function() {


};


Condition.prototype.fromJS = function(data) {
    this.nrOfRepetitions(data.nrOfRepetitions);

    return this;
};


Condition.prototype.toJS = function() {
    return {
        id: this.nrOfRepetitions()
    }
};


var Repetition= function() {
    this.variations = [];


};

Repetition.prototype.setVariations= function() {
    this.factorLevels = [];
    this.conditionIdx = null;

};


var Variation= function() {



};
