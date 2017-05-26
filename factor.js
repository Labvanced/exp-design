// � by Caspar Goeke and Holger Finger

/**
 * This class represents an experimental factor (fixed or random).
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var Factor = function(expData, factorGroup) {
    this.expData = expData;
    this.factorGroup = factorGroup;

    // serialized
    this.id = ko.observable(guid());
    this.globalVar = ko.observable(null);
    this.factorType =  ko.observable('fixed');// either 'fixed' or 'random'
    this.randomizationType =  ko.observable('unbalanced');
    this.balancedInFactor =  ko.observable('Please Select');
    this.balancedInFactor.subscribe(function(oldValue) {
       var test = 1;
    });

    // or maybe better: either 'allFactorialInteractions' or 'redrawRandomPerTrial' or 'balancedBetweenSubjects'

    // not serialized:
    this.nrLevels =  ko.observable(1);
    this.editName = ko.observable(false);
};

Factor.prototype.init = function(name) {
    var globalVar = (new GlobalVar(this.expData)).initProperties('categorical', 'trial', 'nominal', name);
    globalVar.isFactor(true);
    globalVar.isInteracting(true);
    this.globalVar(globalVar);
    this.expData.entities.push(globalVar);
    this.updateLevels();
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
    this._removeLevel(lvlIdx);
    var facIdx =  this.factorGroup.factors().indexOf(this);
    if (this.factorGroup && facIdx>=0) {
        this.factorGroup.removeLevelFromCondition(facIdx,lvlIdx);
    }
};


Factor.prototype._addLevel = function() {
    this.globalVar().addLevel();
};
Factor.prototype._removeLevel = function(idx) {
    this.globalVar().removeLevel(idx);
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Factor.prototype.setPointers = function(entitiesArr) {
    if (entitiesArr.byId[this.globalVar()]){
        this.globalVar(entitiesArr.byId[this.globalVar()]);
    }

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Factor.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.globalVar().id()))
        entitiesArr.push(this.globalVar());
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

    this.globalVar(data.globalVar);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
Factor.prototype.toJS = function() {
    return {
        type: "Factor",
        id: this.id(),
        factorType: this.factorType(),
        randomizationType:this.randomizationType(),
        balancedInFactor: this.balancedInFactor(),
        globalVar: this.globalVar().id()
    };
};


