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



    var self = this;
    this.conditionsLinear = ko.computed(function() {
        var LinearArray = [];
        var conditions = self.conditions();
        var trialStartIdx = 1;

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
                    existingCond.trialStartIdx(trialStartIdx);
                    trialStartIdx += existingCond.repetitions().length;
                    existingCond.conditionIdx(LinearArray.length+1);
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

FactorGroup.prototype.addFactorToCondition= function(factor) {

    if (this.task.isInitialized()){
        var factors = this.factors();
        var conditionArray = this.conditions();

        // for first factor only
        if (factors.length> 1) {
            var self = this;
            function deepClone(arr){

                if (arr[0].constructor === Array) {
                    // recursive call:
                    for (var t = 0; t < arr.length; t++) {
                        deepClone(arr[t]);
                    }
                }
                else {
                    // create new array of new interacting trialTypes with all combinations:
                    for (var t = 0; t < arr.length; t++) {
                        var existingCond = arr[t];

                        // add all levels of this new interacting factor:
                        var nrLevels = factor.levels().length;
                        var conditions = [];
                        var tmpObj=existingCond.toJS();

                        for (var l = 0; l < nrLevels; l++) {
                            // deepCopy
                            var condi = new Condition(self.expData);
                            condi.fromJS(tmpObj);
                            condi.factorLevels(existingCond.factorLevels().slice());
                            condi.factorLevels.push(factor.levels()[l]);
                            condi.factors(existingCond.factors().slice());
                            condi.factors.push(factor);
                            conditions.push(condi);
                        }

                        arr[t] = conditions;
                    }
                }

            }

            // one more dimension of interacting trialTypes with all combinations:
            deepClone(conditionArray, factor.levels().length);

        }

        else{
            for (var l = 0; l < factor.levels().length; l++) {

                var condi = new Condition(this.expData);
               // condi.factorLevelNames.push(condi.levels()[l].name());
                condi.factorLevels.push(factor.levels()[l]);
                condi.factors.push(factor);
                conditionArray.push(condi);
            }
        }
    }

    this.conditions(conditionArray);
};



FactorGroup.prototype.removeFactorFromCondition= function() {


};


FactorGroup.prototype.addLevelToCondition = function() {

    function deepCopyOfSubArrays(arrOrCondition, factorToModify, newLevel){

        var clonedArrOrCondition = null;

        if (arrOrCondition.constructor === Array) {
            clonedArrOrCondition = [];
            // recursive call:
            for (var t = 0; t < arrOrCondition.length; t++) {
                clonedArrOrCondition.push(deepCopyOfSubArrays(arrOrCondition[t], factorToModify, newLevel));
            }
        }
        else if (arrOrCondition.constructor === Condition) {
            // create new array of new interacting trialTypes with all combinations:
            clonedArrOrCondition = new Condition(self.expData);
            clonedArrOrCondition.fromJS(arrOrCondition.toJS());
            clonedArrOrCondition.factorLevels(arrOrCondition.factorLevels().slice());
            clonedArrOrCondition.factors(arrOrCondition.factors().slice());

            // set new level of cloned condition:
            var indexOfModifiedFactor = clonedArrOrCondition.factors().indexOf(factorToModify);
            clonedArrOrCondition.factorLevels()[indexOfModifiedFactor] = newLevel;
        }
        else {
            console.log("error")
        }

        return clonedArrOrCondition;

    }

    function addLevels(subarr, factorVars) {

        // go into all existing levels of this factor (factorVars[0]) and make sure that all sub-factors (factorVars[1...]) have their levels:
        if (factorVars.length>1) {
            for (var i = 0; i < subarr.length; i++) {
                addLevels(subarr[i], factorVars.slice(1)); // recursively add levels within this level
            }
        }

        // make sure that this factor (factorVars[0]) has all it's levels:
        var desired_len = factorVars[0].levels().length;
        for (var i = subarr.length; i<desired_len; i++) {
            subarr[i] = deepCopyOfSubArrays(subarr[subarr.length-1], factorVars[0], factorVars[0].levels()[i]); // adding new level with all sub-levels here
        }
    }

    var self = this;
    if (this.task.isInitialized()){
        var factors = this.factors();
        //var depth = factors.indexOf(factor);
        var conditionArray = this.conditions();
        addLevels(conditionArray, factors);
        this.conditions(conditionArray);
    }

};


FactorGroup.prototype.removeLevelFromCondition= function() {


};



FactorGroup.prototype.closeFactorDialog = function() {
    $("#addFactorDialog").dialog( "close" );
};


FactorGroup.prototype.addFactor = function(factor) {

    this.expData.entities.push(factor.globalVar());

    this.factors.push(factor);
    this.addFactorToCondition(factor);
   // this.addLevelsToCondition();

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





