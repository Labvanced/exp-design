/**
 * Created by cgoeke on 10/6/16.
 */


var Condition= function(expData) {

    // serialized
    this.repetitions = ko.observableArray([]);

    var self = this;

    // not serialized
    this.expData = expData;
    this.factorLevels = ko.observableArray([]); // 0, 1
    this.factors = ko.observableArray([]); // factor1Obj, factor2Obj
    this.trialStartIdx = ko.observable(0);
    this.conditionIdx = ko.observable();
    this.addRepetition()

};





Condition.prototype.setRepetitions = function(nrRepetitions) {

   var currentLength=  this.repetitions().length;
   var lengthToBe =  nrRepetitions;
   var repetitions =  this.repetitions();

     if(currentLength > lengthToBe){
         var diff = currentLength -lengthToBe;
         for (var i =0; i<diff;i++){
             this.removeRepetition()
         }
         this.repetitions(repetitions);
     }

    else if(currentLength < lengthToBe){
         var diff = lengthToBe -currentLength;

         var RepToCopy = this.repetitions()[this.repetitions().length-1];

         for (var i =0; i<diff;i++){
             this.addRepetition()
         }
        this.repetitions(repetitions);
    }

};


Condition.prototype.addRepetition = function() {

    var repetition = new Repetition(this);
    this.repetitions.push(repetition);
};


Condition.prototype.removeRepetition = function() {

    this.repetitions.pop();
};




Condition.prototype.fromJS = function(data) {

    var self = this;
    this.repetitions(jQuery.map( data.repetitions, function( repetition ) {
        return (new Repetition(self)).fromJS(repetition);
    } ));


    return this;
};


Condition.prototype.toJS = function() {

    return {
        repetitions: jQuery.map( this.repetitions(), function( repetition ) { return repetition.toJS(); })
    }
};


var Repetition= function(condition) {
    this.variations = ko.observableArray([]);
    this.condition = condition;
    this.isSelected = ko.observable(false);
};



Repetition.prototype.selectTrial = function(){

    // TODo Select single trials

};

Repetition.prototype.setVariations= function() {
    this.factorLevels = [];
    this.conditionIdx = null;
};

Repetition.prototype.toJS= function() {

    return {}
};

Repetition.prototype.fromJS= function(data) {

    return this;
};



var Variation= function() {



};
