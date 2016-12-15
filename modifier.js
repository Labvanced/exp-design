// � by Caspar Goeke and Holger Finger

/**
 * stores the modifications of properties for different trials.
 *
 * @param {ExpData} expData - the global expData where instances can be retrieved.
 * @param objToModify - the content element of which the properties should be modified.
 * @constructor
 */
var Modifier = function (expData, objToModify) {

    this.expData = expData;
    this.objToModify = objToModify;
    this.factorGroup = null; // this is dynamically retrieved by this.getFactorGroup()...

    // serialized:
    this.factors = ko.observableArray([]); // list of N interacting factors
    this.ndimModifierTrialTypes = []; // N-dim Array of ModifierTrialTypes (each dimension corresponds to one factor)

    this.type = "Modifier";

    // helpers:
    this.selectedTrialType = ko.observable({ type: 'allTrials'});
    this.selectedTrialView = {};

    var modifiableProp = objToModify.modifiableProp;
    for (var i=0; i<modifiableProp.length; i++) {
        var propName = modifiableProp[i];
        this.addProp(propName);
    }

};

/**
 * Recursive function to select an element from a multidimensional array.
 * For example selectFromMultiDimArr(arr, [2,6,3]) will return the value of arr[2][6][3].
 *
 * @param {Array} arr - the multidimensional array
 * @param {Array} indices - the indices of each dimension
 * @returns {*}
 */
function selectFromMultiDimArr(arr, indices){
    var current_array = arr;
    for (var i=0; i<indices.length; i++) {
        current_array = current_array[indices[i]];
    }
    return current_array;
}

/**
 * Recursive function to set an element in a multidimensional array.
 * For example setMultiDimArr(arr, [2,6,3], elem) will set the value of arr[2][6][3] to elem.
 *
 * @param {Array} arr - the multidimensional array
 * @param {Array} indices - the indices of each dimension
 * @param {Array} elem - the element to set
 * @returns {*}
 */
function setMultiDimArr(arr, indices, elem){
    var current_array = arr;
    for (var i=0; i<indices.length-1; i++) {
        current_array = current_array[indices[i]];
    }
    current_array[indices[indices.length-1]] = elem;
}

/**
 * deep clones a multi dimensional array
 * @param multiDimArr - the most inner object which is not an array must implement a method deepCopy()
 * @returns {*}
 */
function deepCloneMultiDimArr(multiDimArr){
    if (multiDimArr instanceof Array) {
        var clonedSubArr = [];
        // recursive call:
        for (var t = 0; t < multiDimArr.length; t++) {
            clonedSubArr.push(deepCloneMultiDimArr(multiDimArr[t]));
        }
        return clonedSubArr;
    }
    else {
        return multiDimArr.deepCopy();
    }
}

/**
 * get the factor group on which this modifier depends on.
 * @returns {FactorGroup}
 */
Modifier.prototype.getFactorGroup = function() {
    if (this.factorGroup == null) {
        var parent = this.objToModify;
        while (parent != null && !parent.hasOwnProperty("factorGroup")) {
            parent = parent.parent;
        }
        if (parent == null) {
            console.error('could not locate factor group.')
        }
        else {
            this.factorGroup = parent.factorGroup;
        }
    }

    return this.factorGroup;
};

/**
 * adds a new modification to this object in the currently selected trial type.
 *
 * @param {string} propName - the name of the property to be modified.
 */
Modifier.prototype.addProp = function(propName) {

    // TODO: performance improvement so that the pureComputed is only executed for properties that were really modified
    // in some condtion/trial. For example use the following to save if a property depends on trials at all:
    // Example: this.propIsModifiedSomewhere[propName] = ko.observable(false);

    this.selectedTrialView[propName] = ko.pureComputed({

        /**
         * returns the value of the property based on the currently selected trial.
         * @returns {number | string}
         */
        read: function () {
            var selectedTrialType = this.selectedTrialType();
            var selectionType = selectedTrialType.type;
            var factors = this.factors();

            if (selectionType=='factorLevel'){

                var factorSelected = selectedTrialType.factor;
                var factorIdx = factors.indexOf(factorSelected);

                // check if this element depends on the selected factor:
                if (!(factorIdx > -1)) {
                    // return the property of parent:
                    return this.objToModify[propName]();
                }

                // construct indices:
                var indices = [];
                for (var t=0; t<factors.length; t++){
                    indices.push(0);
                }
                indices[factorIdx] = selectedTrialType.levelIdx;

                // find first matching modifierTrialType with the given level of the selected factor:
                var modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);

                if (!modifierTrialType){
                    // number of dimensions of ndimModifierTrialTypes does not match number of indices:
                    this.addInteractingLevels();
                    // repeat:
                    modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);
                }

                // if there were modifications of specific trialVariations:
                if (modifierTrialType instanceof Array){
                    modifierTrialType = modifierTrialType[0];
                }

                // check if this property is modified:
                if (modifierTrialType.propIsModified[propName]()) {
                    return modifierTrialType.modifiedProp[propName]();
                }
                else {
                    return this.objToModify[propName]();
                }

            }
            else if (selectionType=='condition'){

                var factorsSelected = selectedTrialType.allFactors;
                var levelsSelected = selectedTrialType.allLevelIdx;

                if (factors.length == 0){
                    var val = this.objToModify[propName]();
                    //console.log("reading parent val="+val+ " because no dependencies yet.")
                    return val;
                }

                // construct indices:
                var indices = [];
                for (var t=0; t<factors.length; t++){
                    if (factors[t] == 'trialVariation') {
                        indices.push();
                    }
                    else {
                        var factorIdx = factorsSelected.indexOf(factors[t]);
                        indices.push(levelsSelected[factorIdx]);
                    }
                }

                // find matching modifierTrialType with the given levels of the selected factors:
                var modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);

                if (!modifierTrialType){
                    // number of dimensions of ndimModifierTrialTypes does not match number of indices:
                    this.addInteractingLevels();
                    // repeat:
                    modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);
                }

                // if there were modifications of specific trialVariations:
                if (modifierTrialType instanceof Array){
                    if (selectionType=='trialVariation') {
                        modifierTrialType = modifierTrialType[selectedTrialType.trialVariation.nr()];
                    }
                    else {
                        modifierTrialType = modifierTrialType[0];
                    }
                }

                // check if this property is modified:
                if (modifierTrialType.propIsModified[propName]()) {
                    var val = modifierTrialType.modifiedProp[propName]();
                    //console.log("reading modified val="+val)
                    return val;
                }
                else {
                    var val = this.objToModify[propName]();
                    //console.log("reading parent val="+val)
                    return val;
                }

            }
            else if (selectionType=='trialVariation') {

                var factorsSelected = selectedTrialType.allFactors;
                var levelsSelected = selectedTrialType.allLevelIdx;
                var selectedTrialIdx = selectedTrialType.trialVariation.nr();

                if (factors.length == 0){
                    var val = this.objToModify[propName]();
                    return val;
                }

                // construct indices:
                var indices = [];
                for (var t=0; t<factors.length; t++){
                    if (factors[t] == 'trialVariation') {
                        indices.push(selectedTrialIdx);
                    }
                    else {
                        var factorIdx = factorsSelected.indexOf(factors[t]);
                        indices.push(levelsSelected[factorIdx]);
                    }
                }

                // find matching modifierTrialType with the given levels of the selected factors:
                var modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);

                if (!modifierTrialType){
                    // number of dimensions of ndimModifierTrialTypes does not match number of indices:
                    this.addInteractingLevels();
                    // repeat:
                    modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);
                }

                // check if this property is modified:
                if (modifierTrialType.propIsModified[propName]()) {
                    var val = modifierTrialType.modifiedProp[propName]();
                    //console.log("reading modified val="+val)
                    return val;
                }
                else {
                    var val = this.objToModify[propName]();
                    //console.log("reading parent val="+val)
                    return val;
                }

            }
            else {
                // 'default' all trials
                return this.objToModify[propName]();
            }
        },

        /**
         * writes the value of the property for the currently selected trial type.
         * @returns {number | string}
         */
        write: function (value) {

            var selectedTrialType = this.selectedTrialType();
            var selectionType = selectedTrialType.type;
            var factors = this.factors();

            if (selectionType=='factorLevel'){

                var factorSelected = selectedTrialType.factor;
                var factorIdx = factors.indexOf(factorSelected);

                // check if this element already depends on the selected factor:
                if (!(factorIdx > -1)) {
                    // add new factor dependency:
                    this.addFactorDependency(factorSelected);
                    factorIdx = factors.indexOf(factorSelected);
                }

                // modify all existing modifierTrialTypes with the given level of the selected factor:
                function modifyAll(modifierTrialTypes, factorIdx, levelIdx, value){

                    if (modifierTrialTypes.constructor === Array){
                        if (factorIdx==0) {
                            modifyAll(modifierTrialTypes[levelIdx], null, null, value);
                        }
                        else {
                            for (var l = 0; l < modifierTrialTypes.length; l++) {
                                modifyAll(modifierTrialTypes[l], factorIdx-1, levelIdx, value);
                            }
                        }
                    }
                    else {
                        modifierTrialTypes.setModification(propName, value);
                    }
                }

                modifyAll(this.ndimModifierTrialTypes, factorIdx, selectedTrialType.levelIdx, value);

            }
            else if (selectionType=='condition'){

                var factorsSelected = selectedTrialType.allFactors;
                var levelsSelected = selectedTrialType.allLevelIdx;

                // make sure to add all dependencies of all factors:
                this._addAllConditionDep();

                // construct indices:
                var indices = [];
                for (var t=0; t<factorsSelected.length; t++){
                    var factorIdx = factorsSelected.indexOf(factors[t]);
                    indices.push(levelsSelected[factorIdx]);
                }

                // find matching modifierTrialType with the given levels of the selected factors:
                var modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);

                if (!modifierTrialType){
                    // number of dimensions of ndimModifierTrialTypes does not match number of indices:
                    console.log("this level was not specified previously... make sure that all levels of dependent factors are added...");
                    this.addInteractingLevels();
                    modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);
                }

                // if there is a dependency on trialVariations:
                if (modifierTrialType instanceof Array) {
                    // modify all sub trials:
                    for (var t=0; t<modifierTrialType.length; t++) {
                        modifierTrialType[t].setModification(propName, value);
                    }
                }
                else {
                    modifierTrialType.setModification(propName, value);
                }

            }
            else if (selectionType=='trialVariation') {
                var factorsSelected = selectedTrialType.allFactors;
                var levelsSelected = selectedTrialType.allLevelIdx;
                var selectedTrialIdx = selectedTrialType.trialVariation.nr();

                // make sure to add dependency on all trials:
                this._addTrialVariationDep();

                // construct indices:
                var indices = [];
                for (var t=0; t<factors.length-1; t++){
                    var factorIdx = factorsSelected.indexOf(factors[t]);
                    indices.push(levelsSelected[factorIdx]);
                }
                indices.push(selectedTrialIdx);

                // find matching modifierTrialType with the given levels of the selected factors:
                var modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);

                if (!modifierTrialType){
                    // number of dimensions of ndimModifierTrialTypes does not match number of indices:
                    console.log("this level was not specified previously... make sure that all levels of dependent factors are added...");
                    this.addInteractingLevels();
                    modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);
                }

                modifierTrialType.setModification(propName, value);
            }
            else {
                // 'default' all trials
                this.objToModify[propName](value);

                // remove all modifications that were made to this property in any trial types:
                this.removeModificationRecursive(this.ndimModifierTrialTypes, propName);
            }
        },
        owner: this
    });
};

/**
 * make sure that this modifier depends on all factors.
 * @private
 */
Modifier.prototype._addAllConditionDep = function() {
    var allFactors = this.getFactorGroup().factors();
    var depFactors = this.factors();
    for (var f=0; f<allFactors.length; f++){
        if (!(depFactors.indexOf(allFactors[f]) > -1)) {
            // add new factor dependency:
            this.addFactorDependency(allFactors[f]);
        }
    }
};

/**
 * make sure that this modifier depends on trialVariations.
 * @private
 */
Modifier.prototype._addTrialVariationDep = function() {
    // check if dependency is already there:
    if (this.factors()[this.factors().length-1] == 'trialVariation') {
        return;
    }

    this._addAllConditionDep();

    function deepClone(multiDimArr, multiDimArrConditions){

        if (multiDimArr[0].constructor === Array) {
            // recursive call:
            for (var t = 0; t < multiDimArrConditions.length; t++) {
                deepClone(multiDimArr[t], multiDimArrConditions[t]);
            }
        }
        else {
            // create new array of new interacting trialTypes with all combinations:
            for (var t = 0; t < multiDimArrConditions.length; t++) {
                var oldMod = multiDimArr[t];
                var numTrials = multiDimArrConditions[t].trials().length;

                // add all trials:
                var newModfiers = [];
                for (var l = 0; l < numTrials; l++) {
                    newModfiers.push(oldMod.deepCopy());
                }

                // overwrite object in multiDimArr[t] with array of cloned objects:
                multiDimArr[t] = newModfiers;
            }
        }

    }

    // one more dimension of interacting trialTypes with all combinations:
    deepClone(this.ndimModifierTrialTypes, this.getFactorGroup().conditions());

    // add new interacting factor:
    this.factors.push('trialVariation');
};

/**
 * add a dependency on a new factor variable.
 * @param factorVar
 */
Modifier.prototype.addFactorDependency = function(factorVar) {

    function deepCloneOuter(multiDimArr, numNewLevels, remainingDepthTillClone){
        var t;
        if (remainingDepthTillClone > 0) {
            // recursive call:
            for (t = 0; t < multiDimArr.length; t++) {
                deepCloneOuter(multiDimArr[t], numNewLevels, remainingDepthTillClone-1);
            }
        }
        else {
            // create new array of new trialTypes with all combinations:
            var clonedMultiDimArr = [];
            for (var i=0; i<numNewLevels; i++) {
                clonedMultiDimArr.push(deepCloneMultiDimArr(multiDimArr));
            }

            // clear the original array and instead add the newly cloned sub arrays:
            multiDimArr.splice(0, multiDimArr.length);
            for (t = 0; t < clonedMultiDimArr.length; t++) {
                multiDimArr.push(clonedMultiDimArr[t]);
            }
        }

    }

    var allFactors = this.getFactorGroup().factors();
    var depFactors = this.factors();
    var numNewLevels = factorVar.globalVar().levels().length;

    if (this.factors().length == 0) {
        // special case, because this is the first factor dependency. Therefore just add all levels to top array:

        // add all levels of this new factor:
        for (var l=0; l<numNewLevels; l++){
            // add this level of the non-interacting factor:
            this.ndimModifierTrialTypes.push(new ModifierTrialType(this.expData, this.objToModify));
        }
    }
    else {
        // find the previous factor that is already a dependent Factor:
        var positionInAllFactors = allFactors.indexOf(factorVar);
        var insertionDepth = 0;
        for (var i=positionInAllFactors; i>=0; i--) {
            insertionDepth = depFactors.indexOf(allFactors[i]);
            if (insertionDepth != -1) {
                break;
            }
        }
        insertionDepth++;

        deepCloneOuter(this.ndimModifierTrialTypes, numNewLevels, insertionDepth);
    }

    // add new interacting factor:
    this.factors.push(factorVar);

};

/**
 * recursively removes the modification of a property from the multidimensional array
 * @param objArr
 * @param propName
 */
Modifier.prototype.removeModificationRecursive = function(objArr,propName) {
    if (objArr.constructor === Array){
        for (var i=0; i<objArr.length; i++){
            this.removeModificationRecursive(objArr[i],propName);
        }
    }
    else {
        objArr.removeModification(propName);
    }
};

/**
 * Select a specific or multiple trial types.
 *
 * @param {object} selectionSpec - the specification of the trials that are selected:
 * 4 types possible:
 * { type: 'allTrials', factorGroup: facGroup_obj }
 * { type: 'factorLevel', factorGroup: facGroup_obj, factor: factor_obj, level: level_obj, levelIdx: numeric}
 * { type: 'condition', factorGroup: facGroup_obj, condition: condition_obj }
 * { type: 'trialVariation', factorGroup: facGroup_obj, trialVariation: trialVariation_obj }
 */
Modifier.prototype.selectTrialType = function(selectionSpec){
    this.selectedTrialType(selectionSpec);
};

/**
 * this function makes sure that trial types for all levels of all factors are present
 */
Modifier.prototype.addInteractingLevels = function() {
    console.log("adding all new levels to modifier...");
    var self = this;

    // if this modifier depends on trialVariations, then add all conditions.
    if (this.factors()[this.factors().length-1] == 'trialVariation') {
        this._addAllConditionDep();
    }

    function updateLevels(multiDimTrialTypes, multiDimConditions, depFactors, allFactors) {

        while (depFactors[0] != allFactors[0]) {
            allFactors = allFactors.slice(1);
            multiDimConditions = multiDimConditions.slice(1);
        }

        // calculate the desired length of the current dimension:
        if (depFactors[0] == 'trialVariation') {
            // make sure that all trial variations are added as dependencies:
            var desired_len = multiDimConditions.trials().length;
        }
        else {
            // make sure that this factor (factorVars[0]) has all it's levels:
            var desired_len = depFactors[0].globalVar().levels().length;
        }

        if (desired_len < multiDimTrialTypes.length) {
            // remove the levels that are not required:
            multiDimTrialTypes.splice(desired_len, desired_len-multiDimTrialTypes.length);
        }
        else if (desired_len > multiDimTrialTypes.length) {
            // fill this dimension with the corresponding number of levels as dependencies:
            var lastElem = multiDimTrialTypes[multiDimTrialTypes.length - 1];
            for (var i = multiDimTrialTypes.length; i < desired_len; i++) {
                multiDimTrialTypes[i] = deepCloneMultiDimArr(lastElem); // adding new level with all sub-levels here
            }
        }

        // go into all existing levels of this factor (factorVars[0]) and make sure that all sub-factors (factorVars[1...]) have their levels:
        if (multiDimTrialTypes[0] instanceof Array) {
            for (var i = 0; i < multiDimTrialTypes.length; i++) {
                updateLevels(multiDimTrialTypes[i], multiDimConditions[i], depFactors.slice(1), allFactors.slice(1)); // recursively add levels within this level
            }
        }

    }

    var factorGroup = this.getFactorGroup();
    updateLevels(this.ndimModifierTrialTypes, factorGroup.conditions(), this.factors(), factorGroup.factors() );
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Modifier.prototype.setPointers = function(entitiesArr) {
    var self = this;

    // convert ids to actual pointers:
    this.factors(jQuery.map( this.factors(), function(id ) {
        return entitiesArr.byId[id];
    } ));
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Modifier.prototype.reAddEntities = function(entitiesArr) {
    // add the direct child nodes:
    jQuery.each( this.factors(), function(index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Modifier}
 */
Modifier.prototype.fromJS = function(data) {
    var self =this;

    function modifierFactoryFromArray(dataArr){
        if (dataArr.constructor === Array){
            var objArr = [];
            for (var i=0; i<dataArr.length; i++){
                var subObjArr = modifierFactoryFromArray(dataArr[i]);
                objArr.push(subObjArr);
            }
            return objArr;
        }
        else {
            var modifierTrialType = new ModifierTrialType(self.expData, self.objToModify);
            return modifierTrialType.fromJS(dataArr);
        }

    }

    if (data.factors)
        this.factors(data.factors);
    if (data.ndimModifierTrialTypes)
        this.ndimModifierTrialTypes = modifierFactoryFromArray(data.ndimModifierTrialTypes);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
Modifier.prototype.toJS = function() {

    function modifierSerializeArray(objArr){
        if (objArr.constructor === Array){
            var dataArr = [];
            for (var i=0; i<objArr.length; i++){
                var subData = modifierSerializeArray(objArr[i]);
                dataArr.push(subData);
            }
            return dataArr;
        }
        else {
            return objArr.toJS();
        }
    }

    var data = {
        factors: jQuery.map( this.factors(), function(factor ) { return factor.id(); } ),
        ndimModifierTrialTypes: modifierSerializeArray(this.ndimModifierTrialTypes),
        type: this.type
    };

    return data;
};

