// � by Caspar Goeke and Holger Finger

/**
 * A factor group is a container of several factors that are interacting. Each factorGroup has a corresponding sequence
 * of frames and / or pages.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @param {ExpTrialLoop} task - The corresponding parent task.
 * @constructor
 */
var FactorGroup= function(expData, task) {
    var self = this;

    this.expData = expData;
    this.task = task;

    // serialized
    this.name = ko.observable("factor_group");
    this.factors = ko.observableArray([]);
    this.conditions = ko.observableArray([]);

    // not serialized
    this.editName =  ko.observable(false);



    var self = this;
    this.conditionsLinear = ko.computed(function() {
        var linearArray = [];
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
                    trialStartIdx += existingCond.trials().length;
                    existingCond.conditionIdx(linearArray.length+1);
                    linearArray.push(existingCond);
                }
            }
        }

        // one more dimension of interacting trialTypes with all combinations:
        if (conditions.length>0){
            deepDive(conditions, conditions.length);
        }

        return linearArray;

    }, this);


};

FactorGroup.prototype.initNewInstance = function () {
    this.name("factor_group" + (this.task.factorGroups().length+1));
};

FactorGroup.prototype.addFactorToCondition = function(factor) {

    if (this.task.isInitialized()){
        var factors = this.factors();
        var levels = factor.globalVar().levels();
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
                        var nrLevels = levels.length;
                        var conditions = [];
                        var tmpObj=existingCond.toJS();

                        for (var l = 0; l < nrLevels; l++) {
                            // deepCopy
                            var condi = new Condition(self.expData);
                            condi.fromJS(tmpObj);
                            condi.factorLevels(existingCond.factorLevels().slice());
                            condi.factorLevels.push(levels[l]);
                            condi.factors(existingCond.factors().slice());
                            condi.factors.push(factor);
                            conditions.push(condi);
                        }

                        arr[t] = conditions;
                    }
                }

            }

            // one more dimension of interacting trialTypes with all combinations:
            deepClone(conditionArray, levels.length);
        }

        else{
            for (var l = 0; l < levels.length; l++) {

                var condi = new Condition(this.expData);
                condi.initNewInstance();
               // condi.factorLevelNames.push(condi.levels()[l].name());
                condi.factorLevels.push(levels[l]);
                condi.factors.push(factor);
                conditionArray.push(condi);
            }
        }
    }

    this.conditions(conditionArray);
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

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
FactorGroup.prototype.setPointers = function (entitiesArr) {
    jQuery.each( this.factors(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
    jQuery.each( this.conditions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
FactorGroup.prototype.reAddEntities = function(entitiesArr) {
    // add the direct child nodes:
    jQuery.each( this.factors(), function( index, factor ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (factor.reAddEntities)
            factor.reAddEntities(entitiesArr);
    } );

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {FactorGroup}
 */
FactorGroup.prototype.fromJS = function(data) {
    var self = this;
    this.name(data.name);
    this.factors(jQuery.map( data.factors, function( factor ) {
        return (new Factor(self.expData)).fromJS(factor);
    }));
    this.conditions(jQuery.map( data.conditions, function( condition ) {
        return (new Condition()).fromJS(condition);
    }));
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
FactorGroup.prototype.toJS = function() {
    return {
        name: this.name(),
        factors: jQuery.map( this.factors(), function( factor ) { return factor.toJS(); }),
        conditions: jQuery.map( this.conditions(), function( condition ) { return condition.toJS(); })
    };
};





