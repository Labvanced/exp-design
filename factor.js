// � by Caspar Goeke and Holger Finger

/**
 * This class represents an experimental factor (fixed or random).
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var Factor = function(expData, factorGroup) {
    var self = this;
    this.expData = expData;
    this.factorGroup = factorGroup;

    // serialized
    this.type = "Factor";
    this.id = ko.observable(guid());
    this.globalVar = ko.observable(null);
    this.factorType =  ko.observable('fixed');// either 'fixed' or 'random'
    this.randomizationType =  ko.observable('unbalanced');
    this.balancedInFactor =  ko.observable(null);
    this.balancedInFactors =  ko.observableArray([]);

    // or maybe better: either 'allFactorialInteractions' or 'redrawRandomPerTrial' or 'balancedBetweenSubjects'



    // not serialized:
    this.nrLevels =  ko.observable(1);
    this.editName = ko.observable(false);
    this.markedForDeletion = false;

};


Factor.prototype.addFactorDependency = function(factor) {

    var obj ={
        name:factor.globalVar().name(),
        id:factor.id(),
        hasDependency:  ko.observable(false)
    };
    this.balancedInFactors.push(obj);
};


Factor.prototype.removeFactorDependency = function(index) {
    this.balancedInFactors.splice(index,1);
};


Factor.prototype.init = function(name,globVar) {
    var self = this;

    for (var i = 0; i<this.factorGroup.factors().length; i++){
        var fac = this.factorGroup.factors()[i];
        var obj ={
            name:fac.globalVar().name(),
            id:fac.id(),
            hasDependency:  ko.observable(false)
        };
        this.balancedInFactors.push(obj);
    }

    if (globVar){
        this.globalVar(globVar);
    }
    else{
        var globalVar = (new GlobalVar(this.expData)).initProperties('categorical', 'trial', 'nominal', name);
        globalVar.isFactor(true);
        globalVar.isInteracting(true);
        this.globalVar(globalVar);
        this.expData.entities.insertIfNotExist(globalVar);
        this.updateLevels();
    }



    this.randomizationConverter();


    // add factor var to local workspace vars in all frames of this sequence
    var name = this.factorGroup.name();
    var found = false;
    var i = 0;
    var sequences = this.factorGroup.expTrialLoop.subSequencePerFactorGroup();
    while (!found && i<sequences.length){
        if (sequences[i].factorGroup.name() == name){
            found = true;
        }
        else{
            i++
        }
    }
    if (found){
       sequences[i].addVariableToWorkspace(this.globalVar());
    }
    this.setVariableBackRef();

    this.factorType.subscribe(function(val) {
        self.factorGroup.updateCondGroups()
    });
};

Factor.prototype.removeBackRef = function() {
    this.globalVar().removeBackRef(this);
};


Factor.prototype.setVariableBackRef = function() {
    var self = this;
    if (this.globalVar() instanceof GlobalVar) {
        this.globalVar().addBackRef(this, this.factorGroup, true, true, 'Factor', function(globalVar)  {
            // check if this factor is still beeing used:
            var still_in_use = true;
            if (!still_in_use) {
                // TODO: remove factor from entities.
                self.removeBackRef();
            }
        });
    }
};


Factor.prototype.updateLevels = function() {
    this.globalVar().levels([]);
   // var nrLevel = this.globalVar().levels().length >0 ? this.globalVar().levels().length : 1;
    for(var i = 0;i<this.nrLevels();i++){
        this._addLevel();
    }
};

Factor.prototype.addLevel = function() {
    this._addLevel();
    if (this.factorGroup) {
        this.factorGroup.addLevelToCondition();
        this.factorGroup.updateCondGroups();
    }
    if (this.factorGroup.expTrialLoop.subSequencePerFactorGroup().length>1){
        this.factorGroup.expTrialLoop.subSequencePerFactorGroup().forEach(function (sequence) {
            sequence.factorGroup.addLevelToCondition();
            sequence.factorGroup.updateCondGroups();
        })
    }

};

Factor.prototype.removeLevel = function(lvlIdx) {
    this.factorGroup.removeLevelFromFactor(this,lvlIdx);
    this.globalVar().removeLevel(lvlIdx);
    this.factorGroup.updateCondGroups();

    // remove lvl form other task with same factor
    var self = this;
    var refs =  this.globalVar().backRefs();
    refs.forEach(function(ref){
      if (ref.refLabel == 'Factor' && ref.entity.factorGroup !==self.factorGroup) {
         ref.entity.factorGroup.removeLevelFromFactor(ref.entity,lvlIdx);
         ref.entity.factorGroup.updateCondGroups();
      }
    });

};

Factor.prototype._addLevel = function() {
    this.globalVar().addLevel();
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Factor.prototype.setPointers = function(entitiesArr) {
    var self = this;
    var globalVar = entitiesArr.byId[this.globalVar()];
    if (globalVar instanceof GlobalVar){
        this.globalVar(globalVar);
        var balancedInFactor = entitiesArr.byId[this.balancedInFactor()];
        if (balancedInFactor){
            this.balancedInFactor(balancedInFactor);
        }

        var balancedInFactors = [];
        jQuery.each( this.balancedInFactors(), function( index, elem ) {
            if (entitiesArr.byId[elem.id] instanceof Factor){
                var obj = {
                    name:  elem.name,
                    id:  elem.id,
                    hasDependency:  ko.observable(elem.hasDependency)
                };
                balancedInFactors.push(obj);
            }

        });
        this.balancedInFactors(balancedInFactors);

        this.randomizationConverter();
    }
    else{ // this should not happen, variable of factor no longer exits!
        this.markedForDeletion = true;
    }

};

/**
 * this function is automatically called after all setPointers have been executed.
 */
Factor.prototype.onFinishedLoading = function() {
    if (this.markedForDeletion) {
        if (this.factorGroup) {
            this.factorGroup.removeFactor(this);
        }
    }
    else {
        this.setVariableBackRef();
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Factor.prototype.reAddEntities = function(entitiesArr) {
    if (this.globalVar() instanceof GlobalVar){
        if (!entitiesArr.byId.hasOwnProperty(this.globalVar().id()))
            entitiesArr.push(this.globalVar());

        if (this.randomizationType()=='balancedInFactor') {
            if (this.balancedInFactor()) {
                if (!entitiesArr.byId.hasOwnProperty(this.balancedInFactor().id()))
                    entitiesArr.push(this.balancedInFactor());
            }
        }
    }

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Factor}
 */
Factor.prototype.fromJS = function(data) {
    this.id(data.id);
    this.factorType(data.factorType);
    if (data.hasOwnProperty('randomizationType')){
        this.randomizationType(data.randomizationType);
    }
    if (data.hasOwnProperty('balancedInFactor')){
        this.balancedInFactor(data.balancedInFactor);
    }
    if (data.hasOwnProperty("balancedInFactors")) {
        this.balancedInFactors(data.balancedInFactors);
    }
    this.globalVar(data.globalVar);

    return this;
};

Factor.prototype.resetFactorDependencies = function() {
    this.balancedInFactors([]);
    if (this.factorGroup){
        for (var i = 0; i<this.factorGroup.factors().length; i++){
            var fac = this.factorGroup.factors()[i];
            if (fac instanceof Factor){
                var globalV= fac.globalVar();
                if (!(globalV instanceof GlobalVar)){
                    globalV = this.expData.entities.byId[globalV];
                }
                if (globalV instanceof GlobalVar){
                    var obj ={
                        name:globalV.name(),
                        id:fac.id(),
                        hasDependency:  ko.observable(false)
                    };
                    this.balancedInFactors.push(obj);
                }

            }

        }
    }

};

Factor.prototype.randomizationConverter = function() {

    if (this.balancedInFactors().length==0){
       this.resetFactorDependencies();
    }

    if (this.randomizationType() == 'balancedInFactor'){
        var varId = this.balancedInFactor();
        for (var i=0; i < this.balancedInFactors().length; i++){
            if (this.balancedInFactors()[i].id == varId){
                this.balancedInFactors()[i].hasDependency(true);
            }
        }
        this.randomizationType('balancedInFactors');
        this.balancedInFactor(null);
    }

    else if (this.randomizationType() == 'balancedConditions'){
        var varIds = [];
        var allFactors  =  this.factorGroup.factors();
        for (var i=0; i < allFactors.length; i++){
            if (allFactors[i].factorType() == 'fixed'){
                varIds.push(allFactors[i].id());
            }
        }

        for (var i=0; i < this.balancedInFactors().length; i++){
            for (var k=0; k < varIds.length; k++){
                var varId = varIds[k];
                if (this.balancedInFactors()[i].id == varId){
                    this.balancedInFactors()[i].hasDependency(true);
                }
            }
        }
        this.randomizationType('balancedInFactors');
        this.balancedInFactor(null);
    }
};




/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
Factor.prototype.toJS = function() {
    var balancedInFactorId = null;
    if (this.randomizationType()=='balancedInFactor') {
        if (this.balancedInFactor() instanceof Factor) {
            balancedInFactorId = this.balancedInFactor().id();
        }
    }

    var balancedInFactors = [];
    for (var i=0; i < this.balancedInFactors().length; i++){
        if (this.expData.entities.byId[this.balancedInFactors()[i].id] instanceof Factor){
            var dep = null;
             if (typeof this.balancedInFactors()[i].hasDependency === 'function'){
                 dep = this.balancedInFactors()[i].hasDependency()
             }
             else{
                 dep = this.balancedInFactors()[i].hasDependency;
             }
            var obj = {
                name:  this.balancedInFactors()[i].name,
                id:  this.balancedInFactors()[i].id,
                hasDependency:  dep
            };
            balancedInFactors.push(obj);
        }
    }

    var globalVarId = null;
    if (this.globalVar() instanceof GlobalVar) {
        globalVarId = this.globalVar().id();
    }

    return {
        type: this.type,
        id: this.id(),
        factorType: this.factorType(),
        randomizationType:this.randomizationType(),
        balancedInFactor: balancedInFactorId,
        balancedInFactors: balancedInFactors,
        globalVar: globalVarId
    };
};


