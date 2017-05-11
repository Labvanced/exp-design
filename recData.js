/**
 * Created by cgoeke on 2/12/16.
 */

/**
 * this class stores the data that should be recorded.
 * @constructor
 */
var RecData = function() {
    this.data = {};
};


/**
 * add the recording of a variable to data
 * @param {globalVar} globalVar - variable to be recorded
 */
RecData.prototype.addRecording = function(globalVar){
    this.data[globalVar.id()] = globalVar.getRecAtEndOfTrial();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RecData}
 */
RecData.prototype.fromJS = function(data) {
    this.data = data.data;
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
RecData.prototype.toJS = function() {
    return {
        data: this.data
    };
};
