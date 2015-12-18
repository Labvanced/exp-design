// � by Caspar Goeke and Holger Finger

var Modifier = function (expData, objToModify) {
    var self = this;

    this.expData = expData;
    this.parent = null;
    this.objToModify = objToModify;

    // serialized:
    this.interactingFactors = ko.observableArray([]); // list of N interacting factors
    this.interactingTrialTypes = []; // N-dim Array of ModifierTrialTypes (each dimension corresponds to one factor)
    this.noninteractFactors = ko.observableArray([]); // list of M non-interacting factors
    this.noninteractTrialTypes = []; // Array-of-Array-of-ModifierTrialTypes (first dimension corresponds to all M factors, second dimension corresponds to levels)

    this.type = "Modifier";

    // helpers:
    this.selectedTrialType = ko.observable({ type: 'default'});
    this.selectedTrialView = {};

    var modifiableProp = objToModify.modifiableProp;
    for (var i=0; i<modifiableProp.length; i++) {
        var propName = modifiableProp[i];
        this.addProp(propName);
    }

};

Modifier.prototype.addProp = function(propName) {

    function selectFromMultiDimArr(arr, indices){
        if (indices.length > 1){
            var curIndex = indices.shift();
            return selectFromMultiDimArr(arr[curIndex], indices);
        }
        else {
            return arr[indices[0]];
        }
    }

    this.selectedTrialView[propName] = ko.pureComputed({
        read: function () {
            var selectedTrialType = this.selectedTrialType();
            var selectionType = selectedTrialType.type;
            var interactingFactors = this.interactingFactors();

            if (selectionType=='wildcard'){

                var factorSelected = selectedTrialType.factor;
                var factorId = interactingFactors.indexOf(factorSelected);

                // check if this element depends on the selected factor:
                if (!(factorId > -1)) {
                    // return the property of parent:
                    return this.objToModify[propName]();
                }

                // construct indices:
                var indices = [];
                for (var t=0; t<interactingFactors.length; t++){
                    indices.push(0);
                }
                indices[factorId] = selectedTrialType.level;

                // find first matching modifierTrialType with the given level of the selected factor:
                var interactingTrialTypes = this.interactingTrialTypes;
                var modifierTrialType = selectFromMultiDimArr(interactingTrialTypes, indices);

                // check if this property is modified:
                if (modifierTrialType.propIsModified[propName]()) {
                    return modifierTrialType.modifiedProp[propName]();
                }
                else {
                    return this.objToModify[propName]();
                }

            }
            else if (selectionType=='interacting'){

                var factorsSelected = selectedTrialType.factors;
                var levelsSelected = selectedTrialType.levels;

                //console.log("read factorsSelected="+JSON.stringify(jQuery.map(factorsSelected,function(val){return val.name()}))+ " levelsSelected="+levelsSelected)

                if (interactingFactors.length == 0){
                    var val = this.objToModify[propName]();
                    //console.log("reading parent val="+val+ " because no dependencies yet.")
                    return val;
                }

                // construct indices:
                var indices = [];
                for (var t=0; t<interactingFactors.length; t++){
                    var factorId = factorsSelected.indexOf(interactingFactors[t]);
                    indices.push(levelsSelected[factorId]);
                }

                // find matching modifierTrialType with the given levels of the selected factors:
                var interactingTrialTypes = this.interactingTrialTypes;
                var modifierTrialType = selectFromMultiDimArr(interactingTrialTypes, indices);

                if (!modifierTrialType){
                    // number of dimensions of interactingTrialTypes does not match number of indices:
                    var val = this.objToModify[propName]();
                    //console.log("reading parent val="+val+ " because dimension mismatch")
                    return val;
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
            else if (selectionType=='noninteract'){

                var factorSelected = selectedTrialType.factor;
                var factorId = this.noninteractFactors().indexOf(factorSelected);

                // check if this element depends on the selected factor:
                if (!(factorId > -1)) {
                    // return the property of parent:
                    return this.objToModify[propName]();
                }

                // read out the modifier:
                var modifierTrialType = this.noninteractTrialTypes[factorId][selectedTrialType.level];

                // check if this property is modified:
                if (modifierTrialType.propIsModified[propName]()) {
                    return modifierTrialType.modifiedProp[propName]();
                }
                else {
                    return this.objToModify[propName]();
                }

            }
            else {
                // 'default' all trials
                return this.objToModify[propName]();
            }
        },
        write: function (value) {

            var selectedTrialType = this.selectedTrialType();
            var selectionType = selectedTrialType.type;
            var interactingFactors = this.interactingFactors();

            if (selectionType=='wildcard'){

                var factorSelected = selectedTrialType.factor;
                var factorId = interactingFactors.indexOf(factorSelected);

                // check if this element already depends on the selected factor:
                if (!(factorId > -1)) {
                    // add new factor dependency:
                    this.addFactorDependency(factorSelected);
                    factorId = interactingFactors.indexOf(factorSelected);
                }

                // modify all existing modifierTrialTypes with the given level of the selected factor:
                function modifyAll(modifierTrialTypes, factorId, level, value){

                    if (modifierTrialTypes.constructor === Array){
                        if (factorId==0) {
                            modifyAll(modifierTrialTypes[level], null, null, value);
                        }
                        else {
                            for (var l = 0; l < modifierTrialTypes.length; l++) {
                                modifyAll(modifierTrialTypes[l], factorId-1, level, value);
                            }
                        }
                    }
                    else {
                        modifierTrialTypes.setModification(propName, value);
                    }
                }

                var modifierTrialTypes = this.interactingTrialTypes;
                modifyAll(modifierTrialTypes, factorId, selectedTrialType.level, value);

            }
            else if (selectionType=='interacting'){

                var factorsSelected = selectedTrialType.factors;
                var levelsSelected = selectedTrialType.levels;

                //console.log("write factorsSelected="+JSON.stringify(jQuery.map(factorsSelected,function(val){return val.name()}))+ " levelsSelected="+levelsSelected)

                // make sure to add all dependencies of all factors:
                for (var f=0; f<factorsSelected.length; f++){
                    if (!(interactingFactors.indexOf(factorsSelected[f]) > -1)) {
                        // add new factor dependency:
                        this.addFactorDependency(factorsSelected[f]);
                    }
                }

                // construct indices:
                var indices = [];
                for (var t=0; t<interactingFactors.length; t++){
                    var factorId = factorsSelected.indexOf(interactingFactors[t]);
                    indices.push(levelsSelected[factorId]);
                }

                // find matching modifierTrialType with the given levels of the selected factors:
                var interactingTrialTypes = this.interactingTrialTypes;
                var modifierTrialType = selectFromMultiDimArr(interactingTrialTypes, indices);
                modifierTrialType.setModification(propName, value);

            }
            else if (selectionType=='noninteract'){

                var factorSelected = selectedTrialType.factor;
                var factorId = this.noninteractFactors().indexOf(factorSelected);

                // check if this element depends on the selected factor:
                if (!(factorId > -1)) {
                    this.addFactorDependency(factorSelected);
                    factorId = this.noninteractFactors().indexOf(factorSelected);
                }

                // read out the modifier:
                var modifierTrialType = this.noninteractTrialTypes[factorId][selectedTrialType.level];
                modifierTrialType.setModification(propName, value);

            }
            else {
                // 'default' all trials
                this.objToModify[propName](value);
            }
        },
        owner: this
    });
}

Modifier.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.interactingFactors(jQuery.map( this.interactingFactors(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
    this.noninteractFactors(jQuery.map( this.noninteractFactors(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
};

Modifier.prototype.selectTrialType = function(selectionSpec){
    this.selectedTrialType(selectionSpec);
};

Modifier.prototype.addFactorDependency = function(factorVar) {

    if (factorVar.subtype() == 'factor') {

        if (this.interactingFactors().length == 0) {
            // special case, because this is the first interacting factor. Therefore just add all levels to top array:

            // add all levels of this new non-interacting factor:
            var levels = factorVar.levels();
            for (var l=0; l<levels.length; l++){
                // add this level of the non-interacting factor:
                this.interactingTrialTypes.push(new ModifierTrialType(this.expData, this.objToModify))
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
                        var levels = factorVar.levels();
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
            deepClone(this.interactingTrialTypes, factorVar.levels().length);
        }

        // add new interacting factor:
        this.interactingFactors.push(factorVar);

    }
    else if (factorVar.subtype() == 'seperate trial type'){

        // create modifierTrialType for all levels of this new non-interacting factor:
        var newModfiersPerLevel = [];
        var levels = factorVar.levels();
        for (var l=0; l<levels.length; l++){
            // add this level of the non-interacting factor:
            newModfiersPerLevel.push(new ModifierTrialType(this.expData, this.objToModify))
        }

        // add new non-interacting factor:
        this.noninteractTrialTypes.push(newModfiersPerLevel);
        this.noninteractFactors.push(factorVar);


    }

};

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

    if (data.interactingFactors)
        this.interactingFactors(data.interactingFactors);
    if (data.interactingTrialTypes)
        this.interactingTrialTypes = modifierFactoryFromArray(data.interactingTrialTypes);

    if (data.noninteractFactors)
        this.noninteractFactors(data.noninteractFactors);
    if (data.noninteractTrialTypes)
        this.noninteractTrialTypes = modifierFactoryFromArray(data.noninteractTrialTypes);

    return this;
};

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
        interactingFactors: jQuery.map( this.interactingFactors(), function( factor ) { return factor.id(); } ),
        interactingTrialTypes: modifierSerializeArray(this.interactingTrialTypes),
        noninteractFactors: jQuery.map( this.noninteractFactors(), function( factor ) { return factor.id(); } ),
        noninteractTrialTypes: modifierSerializeArray(this.noninteractTrialTypes),
        type: this.type
    };

    return data;
};

