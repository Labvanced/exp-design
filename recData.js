/**
 * Created by cgoeke on 2/12/16.
 */

/**
 * this class stores the data that should be recorded.
 * @param variableId
 * @param data
 * @constructor
 */
var RecData = function(variableId,data) {

    this.variableId = variableId;
    this.data = data;

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RecData}
 */
RecData.prototype.fromJS = function(data) {
    this.variableId =data.variableId;
    this.data = data.data;
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
RecData.prototype.toJS = function() {
    return {
        variableId: this.variableId,
        data: this.data
    };
};
