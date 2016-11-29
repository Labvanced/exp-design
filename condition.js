/**
 * Created by cgoeke on 10/6/16.
 */


var Condition = function() {

    // serialized
    this.trials = ko.observableArray([]);

    // not serialized
    this.factorLevels = ko.observableArray([]); // 0, 1
    this.factors = ko.observableArray([]); // factor1Obj, factor2Obj
    this.trialStartIdx = ko.observable(0);
    this.conditionIdx = ko.observable();

};

Condition.prototype.initNewInstance = function() {
    this.addTrial();
};

Condition.prototype.setPointers = function(entitiesArr) {

};

Condition.prototype.setNumTrials = function(numTrialVariations) {

   var currentLength=  this.trials().length;
   var lengthToBe =  numTrialVariations;
   var trialVariations =  this.trials();

     if(currentLength > lengthToBe){
         var diff = currentLength -lengthToBe;
         for (var i =0; i<diff;i++){
             this.removeTrialVariation()
         }
         this.trials(trialVariations);
     }

    else if(currentLength < lengthToBe){
         var diff = lengthToBe -currentLength;

         var RepToCopy = this.trials()[this.trials().length-1];

         for (var i =0; i<diff;i++){
             this.addTrial()
         }
        this.trials(trialVariations);
    }

};


Condition.prototype.addTrial = function() {

    var trialVariations = new TrialVariation(this);
    this.trials.push(trialVariations);
};


Condition.prototype.removeTrialVariation = function() {

    this.trials.pop();
};




Condition.prototype.fromJS = function(data) {

    var self = this;

    this.trials(jQuery.map(data.trials, function (trial) {
        return (new TrialVariation(self)).fromJS(trial);
    }));

    return this;
};


Condition.prototype.toJS = function() {
    return {
        trials: jQuery.map( this.trials(), function(trial ) { return trial.toJS(); })
    }
};


var TrialVariation= function(condition) {
    this.condition = condition;
    this.isSelected = ko.observable(false);
};



TrialVariation.prototype.selectTrial = function(){

    // TODo Select single trials

};

TrialVariation.prototype.setVariations= function() {
    this.factorLevels = [];
    this.conditionIdx = null;
};

TrialVariation.prototype.toJS= function() {

    return {}
};

TrialVariation.prototype.fromJS= function(data) {

    return this;
};