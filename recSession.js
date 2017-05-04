
/**
 * this class stores the data that should be recorded.
 * @constructor
 */
var RecSession = function(parentExperiment) {
    this.parentExperiment = parentExperiment;

    this.user_id = null;
    this.group_nr = null;
    this.rec_session_id = null;
    this.exp_subject_id = null;
    this.session_nr = null;
    this.start_time = null;
    this.end_time = null;
    this.name = null;
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RecSession}
 */
RecSession.prototype.fromJS = function(data) {
    this.user_id = data.user_id;
    this.group_nr = data.group_nr;
    this.rec_session_id = data.rec_session_id;
    this.exp_subject_id = data.exp_subject_id;
    this.session_nr = data.session_nr;
    this.start_time = data.start_time;
    this.end_time = data.end_time;
    this.name = data.name;
    return this;
};
