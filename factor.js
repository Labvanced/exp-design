// � by Caspar Goeke and Holger Finger
var Factor= function(expData) {
    var self = this;

    this.expData = expData;
    this.factorGroup =null;

    // serialized
    this.globalVar = ko.observable();
    this.nrLevels =  ko.observable(1);
    this.factorType =  ko.observable('fixed');

    this.editName = ko.observable(false);
    this.subLevelEdit = ko.observable(false);

    this.levels = ko.observableArray([]);

};


Factor.prototype.init = function(name,factorGroup) {
    this.factorGroup = factorGroup;

    var globalVar = (new GlobalVar(this.expData)).initProperties('categorical', 'trial', 'nominal', name);
    globalVar.isFactor(true);
    globalVar.isInteracting(true);

    this.updateLevels();

    this.globalVar(globalVar);

};

Factor.prototype.updateLevels = function() {
    this.levels([]);
    for(var i = 0;i<this.nrLevels();i++){
        this._addLevel();
    }

};

Factor.prototype.addLevel = function() {
   this._addLevel();
    if (this.factorGroup){
        this.factorGroup.addLevelToCondition();
    }
};


Factor.prototype._addLevel = function() {
    var levelName = "level_"+(this.levels().length+1);
    var level = new Level(levelName);
    this.levels.push(level);
};


Factor.prototype.fromJS = function(data) {
    var self = this;

    return this;
};

Factor.prototype.toJS = function() {

    return {

    };
};


