


////////////////////  GlobalVarValueString  ///////////////////////////////////

GlobalVarValueString = function(parentVar) {
    this.parentVar = parentVar;
    this.value = ko.observable("");
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueString.prototype.fromJS = function(data) {
    this.value(data);
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueString.prototype.toJS = function() {
    return this.value();
};


////////////////////  GlobalVarValueNumeric  ///////////////////////////////////

GlobalVarValueNumeric = function(parentVar) {
    this.parentVar = parentVar;
    this.value = ko.observable(0);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueNumeric.prototype.fromJS = function(data) {
    this.value(data);
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueNumeric.prototype.toJS = function() {
    return this.value();
};


////////////////////  GlobalVarValueBoolean  ///////////////////////////////////

GlobalVarValueBoolean = function(parentVar) {
    this.parentVar = parentVar;
    this.value = ko.observable(false);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueBoolean.prototype.fromJS = function(data) {
    this.value(data);
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueBoolean.prototype.toJS = function() {
    return this.value();
};


////////////////////  GlobalVarValueCategorical  ///////////////////////////////////

GlobalVarValueCategorical = function(parentVar) {
    this.parentVar = parentVar;
    this.value = ko.observable(null);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueCategorical.prototype.fromJS = function(data) {
    this.value(data);
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueCategorical.prototype.toJS = function() {
    return this.value();
};


////////////////////  GlobalVarValueDatetime  ///////////////////////////////////

GlobalVarValueDatetime = function(parentVar) {
    this.parentVar = parentVar;
    this.value = ko.observable(null);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueDatetime.prototype.fromJS = function(data) {
    this.value(data);
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueDatetime.prototype.toJS = function() {
    return this.value();
};

////////////////////  GlobalVarValueTimer  ///////////////////////////////////

GlobalVarValueTimer = function(parentVar) {
    this.parentVar = parentVar;
    this.value = ko.observable("");
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueTimer.prototype.fromJS = function(data) {
    this.value(data);
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueTimer.prototype.toJS = function() {
    return this.value();
};

////////////////////  GlobalVarValueStructure  ///////////////////////////////////

GlobalVarValueStructure = function(parentVar) {
    this.parentVar = parentVar;
    this.value = ko.observable("");
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueStructure.prototype.fromJS = function(data) {
    this.value(data);
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueStructure.prototype.toJS = function() {
    return this.value();
};


////////////////////  GlobalVarValueUndefined  ///////////////////////////////////

GlobalVarValueUndefined = function(parentVar) {
    this.parentVar = parentVar;
    this.value = ko.observable("");
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueUndefined.prototype.fromJS = function(data) {
    this.value(data);
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueUndefined.prototype.toJS = function() {
    return this.value();
};
