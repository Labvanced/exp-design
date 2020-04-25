// � by Caspar Goeke and Holger Finger

/**
 * A factor group is a container of several factors that are interacting. Each factorGroup has a corresponding sequence
 * of frames and / or pages.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var FactorGroup = function (expData, expTrialLoop) {
    var self = this;

    this.expData = expData;
    this.expTrialLoop = expTrialLoop;

    // serialized
    this.name = ko.observable("trial_group");
    this.factors = ko.observableArray([]);
    this.conditions = ko.observableArray([]); // multidimensional array

    // not serialized
    // this.editName =  ko.observable(false);


    this.trialOffset = ko.computed(function () {
        var idx = self.expTrialLoop.factorGroups().indexOf(self);
        if (idx > 0) {
            var l = 0;
            for (var i = 0; i < idx; i++) {
                var facGroup = self.expTrialLoop.factorGroups()[i];
                for (var k = 0; k < facGroup.conditionsLinear().length; k++) {
                    l = l + facGroup.conditionsLinear()[k].trials().length;
                }
            }
            return l
        }
        else {
            return 0
        }
    }, this);


    this.hasOnlyOneFixedFactor = ko.computed(function () {
        var nrFixed = 0;
        for (var i = 0; i < self.factors().length; i++) {
            if (self.factors()[i] instanceof Factor) {
                if (self.factors()[i].factorType() == "fixed") {
                    nrFixed++;
                }
            }

        }

        if (nrFixed == 1) {
            return true
        }
        else {
            return false
        }
    }, this);

    this.hasRandomFactor = ko.computed(function () {
        var out = false;
        for (var i = 0; i < self.factors().length; i++) {
            if (self.factors()[i] instanceof Factor) {
                if (self.factors()[i].factorType() == "random") {
                    out = true;
                }
            }

        }
        return out;

    }, this);



    this.conditionsLinear = ko.computed(function () {
        var linearArray = [];
        var conditions = self.conditions();
        var trialStartIdx = 1;

        function deepDive(arr, numNewLevels) {

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
                    existingCond.conditionIdx(linearArray.length + 1);
                    linearArray.push(existingCond);
                }
            }
        }

        // one more dimension of interacting trialTypes with all combinations:
        if (conditions.length > 0) {
            deepDive(conditions, conditions.length);
        }


        return linearArray;

    }, this);

    this.updateCondGroups();


    this.conditionsLinear.subscribe(function (newVal) {
        self.updateCondGroups();
    });


};



FactorGroup.prototype.getFixedFactorConditions = function () {

    var conditions = this.conditionsLinear();
    var factors = this.factors();

    // get factor type values (random or fixed)
    var type = [];
    for (var i = 0; i < factors.length; i++) {
        if (factors[i].factorType) {
            type.push(factors[i].factorType());
        }

    }

    // get factor levels for each condition, remove factors levels of random factors
    var factorLevels = [];

    for (var i = 0; i < conditions.length; i++) {
        factorLevels.push([]);

        var levels = conditions[i].factorLevels();
        for (var k = 0; k < levels.length; k++) {
            if (type[k] == "fixed") {
                if (levels[k]) {
                    factorLevels[i].push(levels[k].name());
                }
                else {
                    var catchi = 1;
                }

            }
        }
    }

    // join factor levels. Conditions which only differ in random factors now have the identical string
    var factorLevelsCombined = [];
    for (var i = 0; i < factorLevels.length; i++) {
        factorLevelsCombined.push(factorLevels[i].join())
    }

    // find matching strings and save their indicies in output array
    var fixedFactorCondGroups = [];
    var count = -1;
    for (var i = 0; i < factorLevelsCombined.length; i++) {
        var match = factorLevelsCombined[i];
        if (match != '*merelyACopy*') {
            count++;
            fixedFactorCondGroups.push([]);
            for (var k = i; k < factorLevelsCombined.length; k++) {

                if (factorLevelsCombined[k] == match) {
                    fixedFactorCondGroups[count].push(k);
                    factorLevelsCombined[k] = "*merelyACopy*";
                }
            }
        }
    }

    return fixedFactorCondGroups;
};



FactorGroup.prototype.updateCondGroups = function () {
    var condGroups = this.getFixedFactorConditions();
    this.conditionsLinear().forEach(function (condition) {
        condition.setCondGroup(condGroups);
    })
};

FactorGroup.prototype.getFixedFactorLevels = function () {
    var conditions = this.conditionsLinear();
    var factors = this.factors();
    var factorNames = [];
    // get factor type values (random or fixed)
    var type = [];
    for (var i = 0; i < factors.length; i++) {
        type.push(factors[i].factorType());
        if (factors[i].factorType() == "fixed") {
            factorNames.push(i)
        }

    }

    // get factor levels for each condition, remove factors levels of random factors
    var factorLevels = [];

    for (var i = 0; i < conditions.length; i++) {
        factorLevels.push([]);

        var levels = conditions[i].factorLevels();
        for (var k = 0; k < levels.length; k++) {
            if (type[k] == "fixed") {
                if (levels[k]) {
                    factorLevels[i].push(levels[k].name());
                }
                else {
                    var catchi = 1;
                }

            }
        }
    }

    return [factorLevels, factorNames];
};






/**
 * adds a new factor to the tree.
 * @param {Factor} factor - the new factor
 */
FactorGroup.prototype.addFactorToCondition = function (factor) {

    var factors = this.factors();
    var levels = factor.globalVar().levels();
    var conditionArray = this.conditions();

    // for first factor only
    if (factors.length > 1) {
        var self = this;
        function deepClone(arr) {

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
                    var tmpObj = existingCond.toJS();

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
    else {
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
FactorGroup.prototype.addLevelToCondition = function () {

    var self = this;

    function deepCopyOfSubArrays(arrOrCondition, factorToModify, newLevel) {

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
        if (factorVars.length > 1) {
            for (var i = 0; i < subarr.length; i++) {
                addLevels(subarr[i], factorVars.slice(1)); // recursively add levels within this level
            }
        }

        // make sure that this factor (factorVars[0]) has all it's levels:
        var desired_len = factorVars[0].globalVar().levels().length;
        for (var i = subarr.length; i < desired_len; i++) {
            subarr[i] = deepCopyOfSubArrays(subarr[subarr.length - 1], factorVars[0], factorVars[0].globalVar().levels()[i]); // adding new level with all sub-levels here
        }
    }

    var factors = this.factors();
    var conditionArray = this.conditions();
    addLevels(conditionArray, factors);
    this.conditions(conditionArray);

};

FactorGroup.prototype.getSequence = function () {
    // returns the sequence of this factor group
    var sequences = this.expTrialLoop.subSequencePerFactorGroup();
    var i = 0;
    var found = false;
    var out = null;
    while (!found && i < sequences.length) {
        if (this === sequences[i].factorGroup) {
            found = true;
            out = sequences[i];
        }
        else {
            i++;
        }
    }
    return out;
};




/**
 * updates the multi dimensional array with all new levels.
 */
FactorGroup.prototype.removeLevelFromFactor = function (factor, lvlIdx) {

    var factors = this.factors();
    var facIdx = factors.indexOf(factor);

    // update modifiers:
    var factorGroupIdx = this.expTrialLoop.factorGroups().indexOf(this);
    var subSequence = this.expTrialLoop.subSequencePerFactorGroup()[factorGroupIdx];
    var allModifiers = [];
    if (subSequence) {
        subSequence.getAllModifiers(allModifiers);
        for (var i = 0; i < allModifiers.length; i++) {
            allModifiers[i].removeLevelFromFactor(factor, lvlIdx);
        }
    }
    else {
        console.log("error: sequence of factor group not found.")
    }


    // Update conditions table:
    function removeLevels(lvlIdx, requiredDepth, currentDepth, arr) {
        if (currentDepth == requiredDepth) {
            arr.splice(lvlIdx, 1);
        }
        else {
            for (var t = 0; t < arr.length; t++) {
                removeLevels(lvlIdx, requiredDepth, currentDepth + 1, arr[t]);
            }
        }
    }
    var conditions = this.conditions();
    if (factors.length > 1) {
        removeLevels(lvlIdx, facIdx, 0, conditions);
    }
    else {
        conditions.splice(lvlIdx, 1);
    }

    this.conditions(conditions);


    // Now really remove the level from the categorical variable:
    // factors[facIdx].globalVar().removeLevel(lvlIdx);
};

/**
 * add a new factor to the tree.
 * @param {Factor} factor - the new factor
 */
FactorGroup.prototype.addFactor = function (factor) {

    this.expData.entities.insertIfNotExist(factor.globalVar());
    this.expData.entities.insertIfNotExist(factor);

    this.factors.push(factor);
    this.addFactorToCondition(factor);

    for (var i = 0; i < this.factors().length; i++) {
        this.factors()[i].addFactorDependency(factor);
    }
    //not serialized
    this.updateCondGroups();
};

/**
 * remove the factor from the tree and remove the corresponding conditions.
 * @param {Factor} factor - the factor to remove
 */
FactorGroup.prototype.removeFactor = function (factor) {

    var idx = this.factors().indexOf(factor);

    if (factor.globalVar() && factor.globalVar() instanceof GlobalVar) {
        factor.globalVar().removeBackRef(factor);
    }

    function deepRemove(arrMultiDim, subIndex, depth) {
        var t;
        if (depth == idx) {
            arrMultiDim[subIndex] = arrMultiDim[subIndex][0];
        }
        else {
            for (t = 0; t < arrMultiDim[subIndex].length; t++) {
                deepRemove(arrMultiDim[subIndex], t, depth + 1);
            }
        }
    }

    // update modifiers:
    var factorGroupIdx = this.expTrialLoop.factorGroups().indexOf(this);
    var subSequence = this.expTrialLoop.subSequencePerFactorGroup()[factorGroupIdx];
    var allModifiers = [];
    subSequence.getAllModifiers(allModifiers);
    for (var i = 0; i < allModifiers.length; i++) {
        allModifiers[i].removeFactorDependency(factor);
    }

    // update conditions array:
    var arrMultiDim = this.conditions();
    if (idx == 0) {
        arrMultiDim = arrMultiDim[0];
    }
    else {
        for (var t = 0; t < arrMultiDim.length; t++) {
            deepRemove(arrMultiDim, t, 1);
        }
    }
    this.conditions(arrMultiDim);

    jQuery.each(this.conditionsLinear(), function (index, cond) {
        cond.factorLevels.splice(idx, 1);
    });

    for (var i = 0; i < this.factors().length; i++) {
        this.factors()[i].removeFactorDependency(idx);
    }

    this.factors.splice(idx, 1);
    this.updateCondGroups();
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

    this.factors(jQuery.map(this.factors(), function (factorId) {
        var factor = entitiesArr.byId[factorId];
        factor.factorGroup = self;
        return factor;
    }));

    jQuery.each(this.conditionsLinear(), function (index, elem) {
        elem.setPointers(entitiesArr);
    });


};

FactorGroup.prototype.onFinishedLoading = function () {

    var self = this;

    var factors = this.factors();
    var levels = [];
    for (var t = 0; t < factors.length; t++) {
        levels.push(null);
    }

    var condMultiDim = this.conditions();

    function deepDive(condMultiDim, factors, levels, depth) {
        var t;
        if (condMultiDim.constructor === Array) {
            // recursive call:
            for (t = 0; t < condMultiDim.length; t++) {
                var globalVar = factors[depth].globalVar();
                if (!(globalVar instanceof GlobalVar)) {
                    globalVar = self.expData.entities.byId[globalVar];
                }
                levels[depth] = globalVar.levels()[t];
                // HACK to fix experiments  with diverging global var level structure vs. condition structure.
                if (globalVar.levels()[t] === undefined) {
                    console.log("error: level not in globalVar but it should be, creating new Level to avoid corrupted file structure...");
                    levels[depth] = globalVar.addLevel();
                }
                deepDive(condMultiDim[t], factors, levels, depth + 1);
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
FactorGroup.prototype.reAddEntities = function (entitiesArr) {
    // add the direct child nodes:
    jQuery.each(this.factors(), function (index, factor) {
        if (!entitiesArr.byId.hasOwnProperty(factor.id())) {
            entitiesArr.push(factor);
        }

        // recursively make sure that all deep tree nodes are in the entities list:
        if (factor.reAddEntities)
            factor.reAddEntities(entitiesArr);
    });

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {FactorGroup}
 */
FactorGroup.prototype.fromJS = function (data) {
    var self = this;
    this.name(data.name);
    this.factors(data.factors);

    function deepLoadConditions(condMultiDimData) {
        if (condMultiDimData.constructor === Array) {
            // recursive call:
            var condObj = [];
            for (var t = 0; t < condMultiDimData.length; t++) {
                condObj.push(deepLoadConditions(condMultiDimData[t]));
            }
            return condObj;
        }
        else {
            var cond = new Condition(self);
            cond.fromJS(condMultiDimData);
            return cond;
        }
    }

    this.conditions(deepLoadConditions(data.conditions));
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
FactorGroup.prototype.toJS = function () {

    function deepSaveConditions(condMultiDim) {
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
        factors: jQuery.map(this.factors(), function (factor) {
            return factor.id();
        }),
        conditions: deepSaveConditions(this.conditions())
    };
};





