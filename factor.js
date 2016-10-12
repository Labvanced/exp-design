// � by Caspar Goeke and Holger Finger
var Factor= function(expData,nrLevels, type) {
    var self = this;

    this.expData = expData;
    this.factorGroup =null;



    // serialized
    this.globalVar = ko.observable();
    this.name = ko.observable('');
    this.nrLevels = nrLevels;
    this.type = type;

    this.editName = ko.observable(false);
    this.subLevelEdit = ko.observable(false);


    this.levels = ko.observableArray([]);



};

Factor.prototype.init = function(name,factorGroup) {
    this.factorGroup =factorGroup;
    this.name(name);

    var globalVar = (new GlobalVar(this.expData)).initProperties('categorical', 'trial', 'nominal', name);
    globalVar.isFactor(true);
    globalVar.isInteracting(true);

    for(var i = 0;i<this.nrLevels;i++){
        this.addLevel();
    }
    this.addLevelsToCondition(this.name());

    this.globalVar(globalVar);
    this.expData.entities.push(globalVar);
};


Factor.prototype.addLevel = function() {
    var levelName = "level_"+(this.levels().length+1);
    var level = new Level(levelName);
    this.levels.push(level);
};


Factor.prototype.addLevelsToCondition = function() {
    this.factorGroup.addLevelsToCondition(this.name());
};

Factor.prototype.fromJS = function(data) {
    var self = this;

    return this;
};

Factor.prototype.toJS = function() {

    return {

    };
};


