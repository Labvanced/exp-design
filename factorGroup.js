// � by Caspar Goeke and Holger Finger

/**
 * A factor group is a container of several factors that are interacting. Each factorGroup has a corresponding sequence
 * of frames and / or pages.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var FactorGroup= function(expData) {
    var self = this;

    this.expData = expData;

    // serialized
    this.name = ko.observable("factor_group");
    this.factors = ko.observableArray([]);
    this.conditions = ko.observableArray([]); // multidimensional array

    // not serialized
   // this.editName =  ko.observable(false);

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

/**
 * adds a new factor to the tree.
 * @param {Factor} factor - the new factor
 */
FactorGroup.prototype.addFactorToCondition = function(factor) {

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
                        var condi = new Condition(self);
                        condi.fromJS(tmpObj);
                        condi.factorLevels(existingCond.factorLevels().slice());
                        condi.factorLevels.push(levels[l]);
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

            var condi = new Condition(this);
            condi.initNewInstance();
           // condi.factorLevelNames.push(condi.levels()[l].name());
            condi.factorLevels.push(levels[l]);
            conditionArray.push(condi);
        }
    }

    this.conditions(conditionArray);
};

/**
 * updates the multi dimensional array with all new levels.
 */
FactorGroup.prototype.addLevelToCondition = function() {

    var self = this;

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
            clonedArrOrCondition = new Condition(self);
            clonedArrOrCondition.fromJS(arrOrCondition.toJS());
            clonedArrOrCondition.factorLevels(arrOrCondition.factorLevels().slice());

            // set new level of cloned condition:
            var indexOfModifiedFactor = clonedArrOrCondition.factorGroup.factors().indexOf(factorToModify);
            clonedArrOrCondition.factorLevels()[indexOfModifiedFactor] = newLevel;
        }
        else {
            console.log("error");
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
        var desired_len = factorVars[0].globalVar().levels().length;
        for (var i = subarr.length; i<desired_len; i++) {
            subarr[i] = deepCopyOfSubArrays(subarr[subarr.length-1], factorVars[0], factorVars[0].globalVar().levels()[i]); // adding new level with all sub-levels here
        }
    }

    var factors = this.factors();
    var conditionArray = this.conditions();
    addLevels(conditionArray, factors);
    this.conditions(conditionArray);

};

/**
 * add a new factor to the tree.
 * @param {Factor} factor - the new factor
 */
FactorGroup.prototype.addFactor = function(factor) {

    this.expData.entities.push(factor.globalVar());

    this.factors.push(factor);
    this.addFactorToCondition(factor);
   // this.addLevelsToCondition();

};

/**
 * remove the factor from the tree and remove the corresponding conditions.
 * @param {Factor} factor - the factor to remove
 */
FactorGroup.prototype.removeFactor = function(factor) {

    var idx = this.factors().indexOf(factor);

    function deepRemove(arrMultiDim,subIndex,depth) {
        var t;
        if (depth == idx) {
            arrMultiDim[subIndex] = arrMultiDim[subIndex][0];
        }
        else {
            for (t = 0; t < arrMultiDim[subIndex].length; t++) {
                deepRemove(arrMultiDim[subIndex], t, depth+1);
            }
        }
    }

    var arrMultiDim = this.conditions();
    if (idx==0) {
        arrMultiDim = arrMultiDim[0];
    }
    else {
        for (var t = 0; t < arrMultiDim.length; t++) {
            deepRemove(arrMultiDim, t, 1);
        }
    }
    this.conditions(arrMultiDim);

    jQuery.each( this.conditionsLinear(), function(index, cond) {
        cond.factorLevels.splice(idx,1);
    } );

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
    var self = this;

    this.factors(jQuery.map(this.factors(), function (factorIds) {
        var factor = entitiesArr.byId[factorIds];
        factor.factorGroup = self;
        return factor;
    }));

    jQuery.each( this.conditionsLinear(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );

    var factors = this.factors();
    var levels = [];
    for (var t = 0; t < factors.length; t++) {
        levels.push(null);
    }

    var condMultiDim = this.conditions();

    function deepDive(condMultiDim, factors, levels, depth){
        var t;
        if (condMultiDim.constructor === Array) {
            // recursive call:
            for (t = 0; t < condMultiDim.length; t++) {
                var globalVar = factors[depth].globalVar();
                if (!(globalVar instanceof GlobalVar)){
                    globalVar = entitiesArr.byId[globalVar];
                }
                levels[depth] = globalVar.levels()[t];
                deepDive(condMultiDim[t], factors, levels, depth+1);
            }
        }
        else {
            // set level links:
            condMultiDim.factorLevels(levels.slice(0));
        }
    }

    deepDive(condMultiDim, factors, levels, 0);
    this.conditions(condMultiDim);
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
FactorGroup.prototype.reAddEntities = function(entitiesArr) {
    // add the direct child nodes:
    jQuery.each( this.factors(), function( index, factor ) {
        if (!entitiesArr.byId.hasOwnProperty(factor.id())) {
            entitiesArr.push(factor);
        }

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
    this.factors(data.factors);

    function deepLoadConditions(condMultiDimData){
        if (condMultiDimData.constructor === Array) {
            // recursive call:
            var condObj = [];
            for (var t = 0; t < condMultiDimData.length; t++) {
                condObj.push( deepLoadConditions(condMultiDimData[t]) );
            }
            return condObj;
        }
        else {
            var cond = new Condition(self);
            cond.fromJS(condMultiDimData);
            return cond;
        }
    }

    this.conditions(deepLoadConditions( data.conditions));
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
FactorGroup.prototype.toJS = function() {

    function deepSaveConditions(condMultiDim){
        if (condMultiDim.constructor === Array) {
            // recursive call:
            var savedJson = [];
            for (var t = 0; t < condMultiDim.length; t++) {
                savedJson.push(deepSaveConditions(condMultiDim[t]));
            }
            return savedJson;
        }
        else {
            return condMultiDim.toJS();
        }
    }

    return {
        name: this.name(),
        factors: jQuery.map( this.factors(), function( factor ) {
            return factor.id();
        }),
        conditions: deepSaveConditions(this.conditions())
    };
};





