// � by Caspar Goeke and Holger Finger

var ModifierTrialType = function (expData, objToModify) {
    this.expData = expData;
    this.objToModify = objToModify;
    this.modifiedProp = ko.observable({});
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
    var modifiedProp = {};
    for (var prop in data.modifiedProp){
        modifiedProp[propName] = ko.observable(data.modifiedProp[propName]);
    }
    this.modifiedProp(modifiedProp);
    return this;
};

ModifierTrialType.prototype.toJS = function() {
    var modifiedProp = {};
    var modifiedPropKo = this.modifiedProp();
    for (var prop in modifiedPropKo){
        modifiedProp[propName] = modifiedPropKo[propName]();
    }
    return {
        modifiedProp: modifiedProp,
        type: this.type
    };
};

