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
    this.selectedModifier = ko.observable({});

    var modifiableProp = objToModify.modifiableProp;

    /*
    for (var i=0; i<modifiableProp.length; i++) {

        var propName = modifiableProp[i];
        this.selectedTrialView[propName] = ko.pureComputed({
            read: function () {
                var selectedTrialType = this.selectedTrialType();
                var selectionType = selectedTrialType.type;
                if (selectionType=='wildcard'){

                    var factorSelected = selectedTrialType.factor;
                    var factorId = this.factors().indexOf(factorSelected);

                    // check if this element depends on the selected factor:
                    if (!(factorId > -1)) {
                        // return the property of parent:
                        return objToModify[propName]();
                    }

                    // find first matching modifierTrialTypes with the given level of the selected factor:
                    var modifierTrialTypes = this.modifierTrialTypes();
                    for (var t=0; t<modifierTrialTypes.length; t++){
                        if (modifierTrialTypes[t].factorLevels()[factorId] == selectedTrialType.level){
                            var prop = modifierTrialTypes[t].modifiedProp();
                            if (prop.hasOwnProperty(propName)) {
                                return prop[propName](value);
                            }
                            else {
                                return objToModify[propName]();
                            }
                        }
                    }

                    // nothing found, so return the property of parent:
                    return objToModify[propName]();

                }
                else if (selectionType=='interacting'){
                    return objToModify[propName]();
                }
                else if (selectionType=='noninteract'){
                    return objToModify[propName]();
                }
                else {
                    // 'default' all trials
                    return objToModify[propName]();
                }
            },
            write: function (value) {
                var selectedTrialType = this.selectedTrialType();
                var selectionType = selectedTrialType.type;
                if (selectionType=='wildcard'){

                    var factorSelected = selectedTrialType.factor;
                    var factorId = this.factors().indexOf(factorSelected);
                    // check if this element already depends on the selected factor:
                    if (!(factorId > -1)) {
                        // add new factor dependency:
                        this.addFactorDependency(factorSelected);
                        factorId = this.factors().indexOf(factorSelected);
                    }

                    // modify all existing modifierTrialTypes with the given level of the selected factor:
                    var modifierTrialTypes = this.modifierTrialTypes();
                    for (var t=0; t<modifierTrialTypes.length; t++){
                        if (modifierTrialTypes[t].factorLevels()[factorId] == selectedTrialType.level){
                            modifierTrialTypes[t].modifiedProp()[propName](value);
                        }
                    }

                }
                else if (selectionType=='interacting'){

                    var selectedFactors = selectedTrialType.factors();
                    var selectedLevels = selectedTrialType.levels();

                    // make sure to add all dependencies of all factors:
                    for (var f=0; f<selectedFactors.length; f++){
                        if (this.factors().indexOf(selectedFactors[f]) > -1) {
                            // add new factor dependency:
                            this.addFactorDependency(selectedFactors[f]);
                        }
                    }

                    // resort selectedLevels according to the sorting in this.factors()[]:
                    var resortedSelectedLevels = [];
                    for (var f=0; f<selectedFactors.length; f++){
                        resortedSelectedLevels.push();
                    }

                    // modify all existing modifierTrialTypes with the given level of the selected factor:
                    var modifierTrialTypes = this.modifierTrialTypes();
                    for (var t=0; t<modifierTrialTypes.length; t++){
                        if (modifierTrialTypes[t].factorLevels()[factorId] == selectedTrialType.level){
                            modifierTrialTypes[t].modifiedProp()[propName](value);
                        }
                    }
                    objToModify[propName](value);


                }
                else if (selectionType=='noninteract'){


                    objToModify[propName](value);


                }
                else {
                    // 'default' all trials
                    objToModify[propName](value);
                }
            },
            owner: this
        });
    }
    */

};

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

        // add new interacting factor:
        this.interactingFactors.push(factorVar);

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
        this.noninteractFactors.push(factorVar);
        this.noninteractTrialTypes.push(newModfiersPerLevel);

    }

};

Modifier.prototype.fromJS = function(data) {

    function modifierFactoryFromArray(data){
        if (data.constructor === Array){
            return jQuery.map( data, function( subData ) {
                return modifierFactoryFromArray(subData);
            } );
        }
        else {
            var modifierTrialType = new ModifierTrialType(self.expData, self.objToModify);
            return modifierTrialType.fromJS(data);
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
            return jQuery.map( objArr, function( subObjArr ) {
                return modifierSerializeArray(subObjArr);
            } );
        }
        else {
            return objArr.toJS();
        }
    }

    return {
        interactingFactors: jQuery.map( this.interactingFactors(), function( factor ) { return factor.id(); } ),
        interactingTrialTypes: modifierSerializeArray(this.interactingTrialTypes),
        noninteractFactors: jQuery.map( this.noninteractFactors(), function( factor ) { return factor.id(); } ),
        noninteractTrialTypes: modifierSerializeArray(this.noninteractTrialTypes),
        type: this.type
    };
};

