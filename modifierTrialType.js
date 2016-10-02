// � by Caspar Goeke and Holger Finger

var ModifierTrialType = function (expData, objToModify) {
    this.expData = expData;
    this.objToModify = objToModify;
    this.modifiedProp = {};
    this.propIsModified = {};

    var modifiableProp = objToModify.modifiableProp;
    for (var i=0; i<modifiableProp.length; i++) {
        var propName = modifiableProp[i];
        this.propIsModified[propName] = ko.observable(false);
    }

    this.type = "ModifierTrialType";
};


ModifierTrialType.prototype.setModification = function(propName, val) {
    if (!this.propIsModified[propName]()) {
        this.modifiedProp[propName] = ko.observable(val);
        this.propIsModified[propName](true);
    }
    else {
        this.modifiedProp[propName](val);
    }
};

ModifierTrialType.prototype.removeModification = function(propName) {
    this.propIsModified[propName](false);
    delete this.modifiedProp[propName];
};

ModifierTrialType.prototype.deepCopy = function() {
    var newObj = new ModifierTrialType(this.expData, this.objToModify);

    // deep copy of observables:
    var modifiedPropOld = this.modifiedProp;
    var modifiedPropNew = newObj.modifiedProp;
    for (var property in modifiedPropOld) {
        if (modifiedPropOld.hasOwnProperty(property)) {
            modifiedPropNew[property] = ko.observable(modifiedPropOld[property]());
            newObj.propIsModified[property](true);
        }
    }

    return newObj;
};


ModifierTrialType.prototype.fromJS = function(data) {
    var modifiedProp = {};
    for (var prop in data.modifiedProp){
        modifiedProp[prop] = ko.observable(data.modifiedProp[prop]);
        this.propIsModified[prop](true);
    }
    this.modifiedProp = modifiedProp;
    return this;
};

ModifierTrialType.prototype.toJS = function() {
    var modifiedPropData = {};
    var modifiedPropKo = this.modifiedProp;
    for (var prop in modifiedPropKo){
        modifiedPropData[prop] = modifiedPropKo[prop]();
    }
    return {
        modifiedProp: modifiedPropData,
        type: this.type
    };
};

