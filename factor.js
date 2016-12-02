// � by Caspar Goeke and Holger Finger

/**
 * This class represents an experimental factor (fixed or random).
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var Factor = function(expData) {
    this.expData = expData;

    // serialized
    this.globalVar = ko.observable(null);
    this.factorType =  ko.observable('fixed');

    // not serialized:
    this.nrLevels =  ko.observable(1);
    this.editName = ko.observable(false);
    this.subLevelEdit = ko.observable(false);
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
        this.addLevel();
    }
};

Factor.prototype.addLevel = function() {
    this.globalVar().addLevel(this);
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Factor.prototype.setPointers = function(entitiesArr) {
    this.globalVar(entitiesArr.byId[this.globalVar()]);
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
    this.factorType(data.factorType);
    this.globalVar(data.globalVar);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
Factor.prototype.toJS = function() {
    return {
        factorType: this.factorType(),
        globalVar: this.globalVar().id()
    };
};


