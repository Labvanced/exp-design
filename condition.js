
/**
 * This class stores a condition with the associated factors and levels
 *
 * @constructor
 */
var Condition = function(factorGroup) {
    var self = this;

    this.factorGroup = factorGroup;

    // serialized
    this.trials = ko.observableArray([]);
    this.relativePercentage = ko.observable(100);

    // not serialized
    this.factorLevels = ko.observableArray([]); // level_obj1, level_ob2
    this.trialStartIdx = ko.observable(0);
    this.conditionIdx = ko.observable();

    this.trialStartIdx.subscribe(function(newTrialStartIdx) {
        var trialVariations = self.trials();
        for (var i=0; i<trialVariations.length; i++) {
            trialVariations[i].trialIdx(newTrialStartIdx+i);
        }
    });



    this.isDeactivated= ko.computed(function() {
        if (self.trials().length>0){
            return false;
        }
        else{
            return true;
        }
    }, this);


    this.conditionGroup = ko.observable(null);
    /**
         this.conditionGroup = ko.computed(function() {
        return self.getCondGroup();
    }, this);
     **/

    /** instance reference to other condition in the same condition group **/

};


Condition.prototype.getPartnerConditions = function(condGroups) {
    var arr =   condGroups[this.getCondGroup(condGroups)-1];
    var conds = [];
    if (arr){
        for (var i = 0; i< arr.length; i++){
            if (this.factorGroup.conditionsLinear()[arr[i]]){
                if (this.factorGroup.conditionsLinear()[arr[i]] !== this && this.factorGroup.conditionsLinear()[arr[i]].isDeactivated()==false){
                    conds.push(this.factorGroup.conditionsLinear()[arr[i]])
                }
            }
            else{
                console.log("Warning: condition is not there")
            }

        }
    }
    return conds;
};


Condition.prototype.setCondGroup = function(condGroups) {
    this.conditionGroup(this.getCondGroup(condGroups));
};

Condition.prototype.getCondGroup = function(condGroups) {
    var groups =  condGroups;
    var found = false;
    var idx = 0;
    var out = 1;

    while (!found && idx < groups.length){
        var currentGroup = groups[idx];
        if (currentGroup.indexOf(this.conditionIdx()-1)>=0){
            found = true;
            out = idx+1;
        }
        idx++;
    }
    return out;
};


Condition.prototype.getCurrentValueOfFactor = function(idOfGlobalVar) {

    var levelValue = null;
    var levelNames = [];
    for (var i=0; i<this.factorLevels().length; i++) {
        levelNames.push(this.factorLevels()[i].name());
    }

    var facIds= [];
    for (var i=0; i<this.factorGroup.factors().length; i++) {
        facIds.push(this.factorGroup.factors()[i].globalVar().id());
    }

    var idx = facIds.indexOf(idOfGlobalVar);
    if (idx>=0){
        levelValue= levelNames[idx];
    }

    return levelValue;
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
    var lengthToBe = parseInt(numTrialVariations);
    var trialVariations = this.trials();
    var currentLength = trialVariations.length;

    if (currentLength != lengthToBe){

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

        // now apply the same amount of trials to all other sub-conditions in the same condition group
        /**
        this.conditionGroupArray().forEach(function (condition) {
            if (condition.trials().length != parseInt(numTrialVariations)){
                condition.setNumTrials(numTrialVariations);
            }
        })
         **/
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
    if (data.hasOwnProperty('relativePercentage')){
        this.relativePercentage(data.relativePercentage);
    }

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {{trials: *}}
 */
Condition.prototype.toJS = function() {
    return {
        trials: jQuery.map( this.trials(), function(trial ) { return trial.toJS(); }),
        relativePercentage: this.relativePercentage()
    };
};

