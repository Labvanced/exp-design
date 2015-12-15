// � by Caspar Goeke and Holger Finger

var ModifierTrialType = function (expData, objToModify) {
    this.expData = expData;
    this.objToModify = objToModify;

    this.factorLevels = ko.observableArray([]);
    this.modifiedProp = ko.observable({});
    this.isSeperateTrialType = ko.observable(false);
    this.type = "ModifierTrialType";

};

ModifierTrialType.prototype.addModification = function(propName, val) {
    this.modifiedProp()[propName] = ko.observable(val);
};


ModifierTrialType.prototype.removeModification = function(propName) {
    delete this.modifiedProp()[propName];
};


ModifierTrialType.prototype.deepCopy = function() {
    var newObj = new ModifierTrialType(this.expData, this.objToModify);

    // deep copy of factorLevels:
    newObj.factorLevels(this.factorLevels().slice());

    // deep copy of observables:
    var modifiedPropOld = this.modifiedProp();
    var modifiedPropNew = newObj.modifiedProp();
    for (var property in modifiedPropOld) {
        if (modifiedPropOld.hasOwnProperty(property)) {
            modifiedPropNew[property] = ko.observable(modifiedPropOld[property]);
        }
    }

    return newObj;
};


ModifierTrialType.prototype.fromJS = function(data) {
    this.factorLevels(data.factorLevels);
    var modifiedProp = {};
    for (var prop in data.modifiedProp){
        modifiedProp[propName] = ko.observable(data.modifiedProp[propName]);
    }
    this.modifiedProp(modifiedProp);
    this.isSeperateTrialType(data.isSeperateTrialType);
    return this;
};

ModifierTrialType.prototype.toJS = function() {
    var modifiedProp = {};
    var modifiedPropKo = this.modifiedProp();
    for (var prop in modifiedPropKo){
        modifiedProp[propName] = modifiedPropKo[propName]();
    }
    return {
        factorLevels: this.factorLevels(),
        modifiedProp: modifiedProp,
        isSeperateTrialType: this.isSeperateTrialType(),
        type: this.type
    };
};

