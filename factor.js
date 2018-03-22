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
    this.id = ko.observable(guid());
    this.globalVar = ko.observable(null);
    this.factorType =  ko.observable('fixed');// either 'fixed' or 'random'
    this.randomizationType =  ko.observable('unbalanced');
    this.balancedInFactor =  ko.observable(null);
    this.balancedInFactors =  ko.observableArray([]);

    // or maybe better: either 'allFactorialInteractions' or 'redrawRandomPerTrial' or 'balancedBetweenSubjects'


    if (this.factorTypeSubscription){
       this.factorTypeSubscription.dispose();
    }
    this.factorTypeSubscription = this.factorType.subscribe(function() {
        if (self.factorGroup){
            self.factorGroup.conditionGroups(self.factorGroup.getFixedFactorConditions());
        }

    });

    // not serialized:
    this.nrLevels =  ko.observable(1);
    this.editName = ko.observable(false);

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


Factor.prototype.init = function(name) {

    for (var i = 0; i<this.factorGroup.factors().length; i++){
        var fac = this.factorGroup.factors()[i];
        var obj ={
            name:fac.globalVar().name(),
            id:fac.id(),
            hasDependency:  ko.observable(false)
        };
        this.balancedInFactors.push(obj);
    }

    var globalVar = (new GlobalVar(this.expData)).initProperties('categorical', 'trial', 'nominal', name);
    globalVar.isFactor(true);
    globalVar.isInteracting(true);
    this.globalVar(globalVar);
    this.expData.entities.push(globalVar);
    this.updateLevels();

    this.randomizationConverter();

    this.setVariableBackRef();
};


Factor.prototype.setVariableBackRef = function() {

    this.globalVar().addBackRef(this, this.parent, true, true, 'Factor');
};


Factor.prototype.updateLevels = function() {
    this.globalVar().levels([]);
    for(var i = 0;i<this.nrLevels();i++){
        this._addLevel();
    }
};

Factor.prototype.addLevel = function() {
    this._addLevel();
    if (this.factorGroup) {
        this.factorGroup.addLevelToCondition();
    }
};

Factor.prototype.removeLevel = function(lvlIdx) {
    this.factorGroup.removeLevelFromFactor(this,lvlIdx);

    // remove lvl form other task with same factor
    var self = this;
    var refs =  this.globalVar().backRefs();
    refs.forEach(function(ref){
      if (ref.refLabel == 'Factor' && ref.entity.factorGroup !==self.factorGroup) {
         ref.entity.factorGroup.removeLevelFromFactor(ref.entity,lvlIdx);
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
    if (entitiesArr.byId[this.globalVar()]){
        this.globalVar(entitiesArr.byId[this.globalVar()]);
    }
    if (entitiesArr.byId[this.balancedInFactor()]){
        this.balancedInFactor(entitiesArr.byId[this.balancedInFactor()]);
    }
    else {
        this.balancedInFactor(null);
    }

    var balancedInFactors = [];
    jQuery.each( this.balancedInFactors(), function( index, elem ) {
        var obj = {
            name:  elem.name,
            id:  elem.id,
            hasDependency:  ko.observable(elem.hasDependency)
        };
        balancedInFactors.push(obj);
    });
    this.balancedInFactors(balancedInFactors);

    this.setVariableBackRef();

    this.randomizationConverter();
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Factor.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.globalVar().id()))
        entitiesArr.push(this.globalVar());

    if (this.randomizationType()=='balancedInFactor') {
        if (this.balancedInFactor()) {
            if (!entitiesArr.byId.hasOwnProperty(this.balancedInFactor().id()))
                entitiesArr.push(this.balancedInFactor());
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
    for (var i = 0; i<this.factorGroup.factors().length; i++){
        var fac = this.factorGroup.factors()[i];
        var globalV= fac.globalVar();
        if (!(fac.globalVar().hasOwnProperty("name"))){
            globalV = this.expData.entities.byId[globalV];
        }
        var obj ={
            name:globalV.name(),
            id:fac.id(),
            hasDependency:  ko.observable(false)
        };
        this.balancedInFactors.push(obj);
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
        var obj = {
            name:  this.balancedInFactors()[i].name,
            id:  this.balancedInFactors()[i].id,
            hasDependency:  this.balancedInFactors()[i].hasDependency()
        };
        balancedInFactors.push(obj);
    }




    return {
        type: "Factor",
        id: this.id(),
        factorType: this.factorType(),
        randomizationType:this.randomizationType(),
        balancedInFactor: balancedInFactorId,
        balancedInFactors: balancedInFactors,
        globalVar: this.globalVar().id()
    };
};


