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
    this.parent = null;
    this.objToModify = objToModify;

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
    if (indices.length > 1){
        var curIndex = indices.shift();
        return selectFromMultiDimArr(arr[curIndex], indices);
    }
    else {
        return arr[indices[0]];
    }
}

/**
 * adds a new modification to this object in the currently selected trial type.
 *
 * @param {string} propName - the name of the property to be modified.
 */
Modifier.prototype.addProp = function(propName) {

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
                var factorId = factors.indexOf(factorSelected);

                // check if this element depends on the selected factor:
                if (!(factorId > -1)) {
                    // return the property of parent:
                    return this.objToModify[propName]();
                }

                // construct indices:
                var indices = [];
                for (var t=0; t<factors.length; t++){
                    indices.push(0);
                }
                indices[factorId] = selectedTrialType.levelIdx;

                // find first matching modifierTrialType with the given level of the selected factor:
                var modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);

                if (!modifierTrialType){
                    // number of dimensions of ndimModifierTrialTypes does not match number of indices:
                    this.addInteractingLevels();
                    // repeat:
                    modifierTrialType = selectFromMultiDimArr(this.ndimModifierTrialTypes, indices);
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

                //console.log("read factorsSelected="+JSON.stringify(jQuery.map(factorsSelected,function(val){return val.name()}))+ " levelsSelected="+levelsSelected)

                if (factors.length == 0){
                    var val = this.objToModify[propName]();
                    //console.log("reading parent val="+val+ " because no dependencies yet.")
                    return val;
                }

                // construct indices:
                var indices = [];
                for (var t=0; t<factors.length; t++){
                    var factorId = factorsSelected.indexOf(factors[t]);
                    indices.push(levelsSelected[factorId]);
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
                var factorId = factors.indexOf(factorSelected);

                // check if this element already depends on the selected factor:
                if (!(factorId > -1)) {
                    // add new factor dependency:
                    this.addFactorDependency(factorSelected);
                    factorId = factors.indexOf(factorSelected);
                }

                // modify all existing modifierTrialTypes with the given level of the selected factor:
                function modifyAll(modifierTrialTypes, factorId, levelIdx, value){

                    if (modifierTrialTypes.constructor === Array){
                        if (factorId==0) {
                            modifyAll(modifierTrialTypes[levelIdx], null, null, value);
                        }
                        else {
                            for (var l = 0; l < modifierTrialTypes.length; l++) {
                                modifyAll(modifierTrialTypes[l], factorId-1, levelIdx, value);
                            }
                        }
                    }
                    else {
                        modifierTrialTypes.setModification(propName, value);
                    }
                }

                modifyAll(this.ndimModifierTrialTypes, factorId, selectedTrialType.levelIdx, value);

            }
            else if (selectionType=='condition'){

                var factorsSelected = selectedTrialType.allFactors;
                var levelsSelected = selectedTrialType.allLevelIdx;

                //console.log("write factorsSelected="+JSON.stringify(jQuery.map(factorsSelected,function(val){return val.name()}))+ " levelsSelected="+levelsSelected)

                // make sure to add all dependencies of all factors:
                for (var f=0; f<factorsSelected.length; f++){
                    if (!(factors.indexOf(factorsSelected[f]) > -1)) {
                        // add new factor dependency:
                        this.addFactorDependency(factorsSelected[f]);
                        factors = this.getIdsOfFactors(this.factors()); // update with new list
                    }
                }

                // construct indices:
                var indices = [];
                for (var t=0; t<factors.length; t++){
                    var factorId = factorsSelected.indexOf(factors[t]);
                    indices.push(levelsSelected[factorId]);
                }

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

Modifier.prototype.getIdsOfFactors = function(factorArr) {
    var factorIds = $.map(factorArr, function(factor) {
        if (factor instanceof GlobalVar) {
            return factor.id();
        }
        else {
            return factor;
        }
    });
    return factorIds;
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
 * this function makes sure that trial types for all levels of all interacting factors are present
 */
Modifier.prototype.addInteractingLevels = function() {
    console.log("adding all new levels to modifier...");
    var self = this;

    function createSubArr(factorVars) {
        if (factorVars.length > 0) {
            var subArr = [];
            var len = factorVars[0].globalVar().levels().length;
            for (var i=0; i<len; i++) {
                subArr.push(createSubArr(factorVars.slice(1))); // recursively create sub array
            }
            return subArr;
        }
        else {
            return new ModifierTrialType(self.expData, self.objToModify);
        }
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
            subarr[i] = createSubArr(factorVars.slice(1)); // adding new level with all sub-levels here
        }
    }

    addLevels(this.ndimModifierTrialTypes, this.factors());
};

/**
 * add a dependency on a new factor variable.
 * @param factorVar
 */
Modifier.prototype.addFactorDependency = function(factorVar) {

    //if (!(factorVar instanceof GlobalVar)){
    //    factorVar = this.expData.entities.byId[factorVar];
    //}

    if (this.factors().length == 0) {
        // special case, because this is the first interacting factor. Therefore just add all levels to top array:

        // add all levels of this new non-interacting factor:
        var levels = factorVar.globalVar().levels();
        for (var l=0; l<levels.length; l++){
            // add this level of the non-interacting factor:
            this.ndimModifierTrialTypes.push(new ModifierTrialType(this.expData, this.objToModify))
        }

    }
    else {

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
                    var oldMod = arr[t];

                    // add all levels of this new interacting factor:
                    var levels = factorVar.globalVar().levels();
                    var newModfiersPerLevel = [];
                    for (var l = 0; l < levels.length; l++) {
                        newModfiersPerLevel.push(oldMod.deepCopy());
                    }

                    // overwrite object in arr[t] with array of cloned objects:
                    arr[t] = newModfiersPerLevel;
                }
            }

        }

        // one more dimension of interacting trialTypes with all combinations:
        deepClone(this.ndimModifierTrialTypes, factorVar.globalVar().levels().length);
    }

    // add new interacting factor:
    this.factors.push(factorVar);

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

