/**
 * Created by cgoeke on 2/12/16.
 */

/**
 * this class stores the data that should be recorded.
 * @constructor
 */
var RecData = function () {
    this.data = {};
    this.scope = "trial"; // any of GlobalVar.scopes (i.e. 'subject', 'session', 'task', 'trial')
};


/**
 * add the recording of a variable to data
 * @param {globalVar} globalVar - variable to be recorded
 */
RecData.prototype.addRecording = function (globalVar, saveByName, isDuringTrial) {
    var recVal;
    if (isDuringTrial) {
        recVal = globalVar.getRecDuringTrial();
    }
    else {
        recVal = globalVar.getRecAtEndOfTrial();
    }

    if (saveByName) {
        this.data[globalVar.name()] = recVal;
    }
    else {
        this.data[globalVar.id()] = recVal;
    }

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RecData}
 */
RecData.prototype.fromJS = function (data) {
    this.data = data.data;
    if (data.hasOwnProperty('scope')) {
        this.scope = data.scope;
    }
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
RecData.prototype.toJS = function () {
    return {
        data: this.data,
        scope: this.scope
    };
};
