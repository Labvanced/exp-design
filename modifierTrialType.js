// � by Caspar Goeke and Holger Finger

/**
 * This class manages the modifications of properties of content elements for one specific trial specificiation.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @param objToModify
 * @constructor
 */
var ModifierTrialType = function (expData, objToModify) {
    this.expData = expData;
    this.objToModify = objToModify;
    this.modifiedProp = {};
    this.propIsModified = {};

    var modifiableProp = objToModify.modifiableProp;
    for (var i = 0; i < modifiableProp.length; i++) {
        var propName = modifiableProp[i];
        this.propIsModified[propName] = ko.observable(false);
    }

    this.type = "ModifierTrialType";
};

/**
 * define a specific modification of a property.
 * @param {string} propName - the name of the property
 * @param {number | string} val - the value of the property
 */
ModifierTrialType.prototype.setModification = function (propName, val) {
    if (!this.propIsModified[propName]()) {
        this.modifiedProp[propName] = ko.observable(val);
        this.propIsModified[propName](true);
    }
    else {
        this.modifiedProp[propName](val);
    }
};

/**
 * removes a specific modification of a property (i.e. sets it back to the default trial type).
 *
 * @param {string} propName - the name of the property
 */
ModifierTrialType.prototype.removeModification = function (propName) {
    this.propIsModified[propName](false);
    delete this.modifiedProp[propName];
};

/**
 * creates a deep copy of this instance.
 *
 * @returns {ModifierTrialType}
 */
ModifierTrialType.prototype.deepCopy = function () {
    var newObj = new ModifierTrialType(this.expData, this.objToModify);

    // deep copy of observables:
    var modifiedPropOld = this.modifiedProp;
    var modifiedPropNew = newObj.modifiedProp;
    for (var property in modifiedPropOld) {
        if (modifiedPropOld.hasOwnProperty(property)) {
            if (typeof this.objToModify.cloneModifiableProp == 'function') {
                var newPropVal = this.objToModify.cloneModifiableProp(property, modifiedPropOld[property]());
                modifiedPropNew[property] = ko.observable(newPropVal);
            }
            else {
                modifiedPropNew[property] = ko.observable(modifiedPropOld[property]());
            }
            newObj.propIsModified[property](true);
        }
    }

    return newObj;
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ModifierTrialType}
 */
ModifierTrialType.prototype.fromJS = function (data) {
    var modifiedProp = {};
    for (var prop in data.modifiedProp) {
        if (this.propIsModified.hasOwnProperty(prop)) {
            modifiedProp[prop] = ko.observable(data.modifiedProp[prop]);
            this.propIsModified[prop](true);
        }
        else {
            console.log('WARNING: property ' + prop + ' that was modified does not exist anymore.');
        }
    }
    this.modifiedProp = modifiedProp;
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ModifierTrialType.prototype.toJS = function () {
    var modifiedPropData = {};
    var modifiedPropKo = this.modifiedProp;
    for (var prop in modifiedPropKo) {
        modifiedPropData[prop] = modifiedPropKo[prop]();
    }
    return {
        modifiedProp: modifiedPropData,
        type: this.type
    };
};

