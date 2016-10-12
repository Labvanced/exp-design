// � by Caspar Goeke and Holger Finger

var FactorGroup= function(expData, task) {
    var self = this;

    this.expData = expData;
    this.task = task;

    // serialized
    this.name = "factor_group" + (this.task.factorGroups().length+1);
    this.factors = ko.observableArray([]);
    this.conditions = ko.observableArray([]);

    // not serialized
    this.editName =  ko.observable(false);
    this.newFactorName =  ko.observable('myNewFactor');
    this.newLevelsNr =  ko.observable(1);
    this.newFactorType =  ko.observable('fixed');

    this.trialTypes = ko.computed(function() {
        return []
    }, this);


    this.conditionsLinear = ko.computed(function() {
        var LinearArray = [];
        var conditions = self.conditions();

        function deepDive(arr, numNewLevels){

            if (arr[0].constructor === Array) {
                // recursive call:
                for (var t = 0; t < arr.length; t++) {
                    deepDive(arr[t], numNewLevels);
                }
            }
            else {
                // create new array of new interacting trialTypes with all combinations:
                for (var t = 0; t < arr.length; t++) {
                    var existingCond = arr[t];
                    LinearArray.push(existingCond);
                }
            }

        }

        // one more dimension of interacting trialTypes with all combinations:
        if (conditions.length>0){
            deepDive(conditions, conditions.length);
        }



        return LinearArray;

    }, this);




};

FactorGroup.prototype.init= function() {

    $( function() {
        $("#addFactorDialog").dialog();
    } );
    $( "#addFactorDialog" ).dialog( "close" );

};

FactorGroup.prototype.resetFactorProps= function() {
    this.newFactorName('myNewFactor');
    this.newLevelsNr(1);
    this.newFactorType('fixed');

};



FactorGroup.prototype.addFactorToCondition= function(factor) {

    if (this.task.isInitialized()){
        var factors = this.factors();
        var conditionArray = this.conditions();

        // for first factor only
        if (factors.length> 1) {
            var self = this;
            function deepClone(arr, numNewLevels){

                if (arr[0].constructor === Array) {
                    // recursive call:
                    for (var t = 0; t < arr.length; t++) {
                        deepClone(arr[t], numNewLevels);
                    }
                }
                else {
                    // create new array of new interacting trialTypes with all combinations:
                    for (var t = 0; t < arr.length; t++) {
                        var existingCond = arr[t];

                        // add all levels of this new interacting factor:
                        var nrLevels = factor.levels().length;
                        var conditions = [];

                        for (var l = 0; l <= nrLevels; l++) {
                            // deepCopy
                            var condi = new Condition(self.expData);
                            condi.nrOfRepetitions(existingCond.nrOfRepetitions());
                            conditions.push(condi);
                        }

                        arr[t] = conditions;
                    }
                }

            }

            // one more dimension of interacting trialTypes with all combinations:
            deepClone(conditionArray, factor.levels().length);

        }
    }

    this.conditions(conditionArray);
};



FactorGroup.prototype.removeFactorFromCondition= function() {


};


FactorGroup.prototype.addLevelsToCondition = function(factorName) {


    function createSubArr(factors) {
        if (factors.length > 0) {
            var subArr = [];
            var len = factors[0].levels().length;
            for (var i=0; i<len; i++) {
                subArr.push(createSubArr(factors.slice(1))); // recursively create sub array
            }
            return subArr;
        }
        else {
            var condition =  new Condition(self.expData);
         //   condition.factorLevelNames.push(factor.levels()[l].name());
          //  condition.factorLevels.push(l);
            return condition
        }
    }

    function addLevels(conditions, factors) {

        // go into all existing levels of this factor (factorVars[0]) and make sure that all sub-factors (factorVars[1...]) have their levels:
        if (factors.length>1) {
            for (var i = 0; i < conditions.length; i++) {
                addLevels(conditions[i], factors.slice(1)); // recursively add levels within this level
            }
            return conditions
        }


        else{
            var desired_len = factors[0].levels().length;
            for (var i = conditions.length; i<desired_len; i++) {
                conditions[i] = createSubArr(factors.slice(1)); // adding new level with all sub-levels here
            }
            return conditions
        }

        // make sure that this factor (factorVars[0]) has all it's levels:
    //    var desired_len = factors[0].levels().length;
     //   for (var i = conditions.length; i<desired_len; i++) {
     //       conditions[i] = createSubArr(factors.slice(1)); // adding new level with all sub-levels here
    //    }


    }


    var self = this;
    if (this.task.isInitialized()){
        var factors = this.factors();
        var conditionArray = this.conditions();
        conditionArray= addLevels(conditionArray, factors);
        this.conditions(conditionArray);
    }



};


FactorGroup.prototype.removeLevelFromCondition= function() {


};

FactorGroup.prototype.openFactorDialog = function(data,event) {

    $( "#addFactorDialog" ).dialog("option", "position", {
        my: "left",
        at: "left",
        of: event
    });
    $("#addFactorDialog").dialog( "open" );

};

FactorGroup.prototype.closeFactorDialog = function() {
    $("#addFactorDialog").dialog( "close" );
};


FactorGroup.prototype.addFactor = function() {

    $("#addFactorDialog").dialog( "close" );

    var name = this.newFactorName();
    var factor = new Factor(this.expData,this.newLevelsNr(),this.newFactorType());
    this.factors.push(factor);
    this.addFactorToCondition(factor);
    this.resetFactorProps();
    factor.init(name,this);

};

FactorGroup.prototype.renameFactor= function(idx,flag) {

    if (flag == "true"){
        this.factors()[idx].editName(true);
    }
    else if (flag == "false"){
        this.factors()[idx].editName(false);
    }
};


FactorGroup.prototype.removeFactor = function(idx) {


    this.factors.splice(idx,1);
};



FactorGroup.prototype.fromJS = function(data) {

};

FactorGroup.prototype.toJS = function() {

};





