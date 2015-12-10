// � by Caspar Goeke and Holger Finger

var Modifier = function (expData, objToModify) {
    this.expData = expData;
    this.objToModify = objToModify;

    this.factors = ko.observableArray([]); // Array of GlobalVar
    this.modifierTrialTypes = ko.observableArray([]); // Array of ModifierTrialTypes
    this.type = "Modifier";

    this.selectedTrialType = ko.observable();

};

Modifier.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.factors(jQuery.map( this.factors(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
};

Modifier.prototype.selectTrialType = function(index){
    this.selectedTrialType(this.modifierTrialTypes()[index]);
};

Modifier.prototype.addFactorDependency = function(factorVar) {

    this.factors.push(factorVar);

    // use local variables for performance:
    var modifierTrialTypes = this.modifierTrialTypes();
    var factors = this.factors();

    // create null array which can be copied into new trialTypes:
    var nullArray = [];
    for (var f=0; f<factors.length-1; f++){
        nullArray.push(null);
    }
    
    // update the modifierTrialTypes
    if (factorVar.subtype() == 'factor') {
        // add new interacting factor:

        // calculate seperate arrays of previous interacting and non-interacting factors:
        var interactingTrialTypes = [];
        var allNewModifierTrialTypes = [];
        for (var t=0; t<modifierTrialTypes.length; t++){
            if (modifierTrialTypes[t].isSeperateTrialType()){
                // directly reuse the non-interacting trialTypes
                allNewModifierTrialTypes.push(modifierTrialTypes[t]);

                // modify with the new column:
                modifierTrialTypes[t].factorLevels.push(null);
            }
            else {
                // push interacting trialTypes into array to handle them further down:
                interactingTrialTypes.push(modifierTrialTypes[t]);
            }
        }

        if (interactingTrialTypes.length == 0) {
            // special case, because this is the first interacting factor. Therefore just add all levels:

            // add all levels of this new non-interacting factor:
            var levels = factorVar.levels();
            for (var l=0; l<levels.length; l++){
                // add this level of the non-interacting factor:
                var newModifierTrialType = new ModifierTrialType(this.expData, this.objToModify);

                var factorLevels = nullArray.slice(); // copy null array
                factorLevels.push(levels[l]); // as last entry enter the level of the non-interacting factor
                newModifierTrialType.factorLevels(factorLevels);

                allNewModifierTrialTypes.push(newModifierTrialType)
            }

        }
        else {
            // create new array of new interacting trialTypes with all combinations:
            for (var t=0; t<interactingTrialTypes.length; t++){

                // add all levels of this new interacting factor:
                var levels = factorVar.levels();
                for (var l=0; l<levels.length; l++) {
                    // mix previous trialType t with level l of the newly interacting factor:
                    var newModifierTrialType = interactingTrialTypes[t].deepCopy();
                    newModifierTrialType.factorLevels.push(levels[l]);
                    allNewModifierTrialTypes.push(newModifierTrialType);
                }

            }
        }

        // update observable array:
        this.modifierTrialTypes(allNewModifierTrialTypes);

    }
    else if (factorVar.subtype() == 'seperate trial type'){
        // add new non-interacting factor:

        // add to all previous modifiers a new null entry (column of new non-interacting factor):
        for (var t=0; t<modifierTrialTypes.length; t++){
            modifierTrialTypes[t].factorLevels.push(null);
        }

        // add all levels of this new non-interacting factor:
        var levels = factorVar.levels();
        for (var l=0; l<levels.length; l++){
            // add this level of the non-interacting factor:
            var newModifierTrialType = new ModifierTrialType(this.expData, this.objToModify);

            var factorLevels = nullArray.slice(); // copy null array
            factorLevels.push(levels[l]); // as last entry enter the level of the non-interacting factor
            newModifierTrialType.factorLevels(factorLevels);
            newModifierTrialType.isSeperateTrialType(true);

            this.modifierTrialTypes.push(newModifierTrialType)
        }
    }

};

Modifier.prototype.fromJS = function(data) {
    this.factors(data.factors);
    this.modifierTrialTypes(jQuery.map( data.modifierTrialTypes, function( modifierTrialType ) {
        return (new ModifierTrialType(this.expData, this.objToModify)).fromJS(modifierTrialType);
    } ));
    return this;
};

Modifier.prototype.toJS = function() {
    return {
        factors: jQuery.map( this.factors(), function( factor ) { return factor.id(); } ),
        modifierTrialTypes: jQuery.map( this.modifierTrialTypes(), function( modifierTrialType ) { return modifierTrialType.toJS(); } ),
        type: this.type
    };
};
