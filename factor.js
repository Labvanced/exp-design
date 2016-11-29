// � by Caspar Goeke and Holger Finger
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

Factor.prototype.setPointers = function(entitiesArr) {
    this.globalVar(entitiesArr.byId[this.globalVar()]);
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
    this.globalVar().addLevel();
};

Factor.prototype.fromJS = function(data) {
    this.factorType(data.factorType);
    this.globalVar(data.globalVar);
    return this;
};

Factor.prototype.toJS = function() {
    return {
        factorType: this.factorType(),
        globalVar: this.globalVar().id()
    };
};


