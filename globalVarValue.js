


////////////////////  GlobalVarValueString  ///////////////////////////////////

GlobalVarValueString = function(parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable("");
    this.value.subscribe(function() {
        self.parentVar.notifyValueChanged();
    });
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param valueObj
 */
GlobalVarValueString.prototype.setValue = function(valueObj) {
    if (valueObj.hasOwnProperty('parentVar')){
        valueObj = valueObj.toJS();
    }
    // convert other data types to string:
    if ((typeof valueObj) != "string") {
        valueObj = String(valueObj);
    }
    this.value(valueObj);
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
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(0);
    this.value.subscribe(function() {
        self.parentVar.notifyValueChanged();
    });
};


/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param valueObj
 */
GlobalVarValueNumeric.prototype.setValue = function(valueObj) {
    if (valueObj.hasOwnProperty('parentVar')){
        valueObj = valueObj.toJS();
    }
    // convert other data types to string:
    if ((typeof valueObj) != "number") {
        valueObj = Number(valueObj);
    }
    this.value(valueObj);
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
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(false);
    this.value.subscribe(function() {
        self.parentVar.notifyValueChanged();
    });
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param valueObj
 */
GlobalVarValueBoolean.prototype.setValue = function(valueObj) {
    if (valueObj.hasOwnProperty('parentVar')){
        valueObj = valueObj.toJS();
    }
    // convert other data types to string:
    if ((typeof valueObj) != "boolean") {
        valueObj = Boolean(valueObj);
    }
    this.value(valueObj);
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
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(null);
    this.value.subscribe(function(val) {
        self.parentVar.notifyValueChanged();
    });
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param valueObj
 */
GlobalVarValueCategorical.prototype.setValue = function(valueObj) {
    if (valueObj.hasOwnProperty('parentVar')){
        valueObj = valueObj.toJS();
    }
    // convert other data types to string:
    if ((typeof valueObj) != "string") {
        valueObj = String(valueObj);
    }
    if (this.parentVar.levels().indexOf(valueObj) == -1){
        this.value(null);
    }
    else {
        this.value(valueObj);
    }
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
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(null);
    this.value.subscribe(function() {
        self.parentVar.notifyValueChanged();
    });
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param valueObj
 */
GlobalVarValueDatetime.prototype.setValue = function(valueObj) {
    if (valueObj.hasOwnProperty('parentVar')){
        valueObj = valueObj.toJS();
    }
    // convert to Date object:
    valueObj = new Date(valueObj);
    this.value(valueObj);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueDatetime.prototype.fromJS = function(data) {
    this.value(new Date( data ));
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueDatetime.prototype.toJS = function() {
    return JSON.stringify( this.value() );
};

////////////////////  GlobalVarValueTimer  ///////////////////////////////////

GlobalVarValueTimer = function(parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(0); // in ms
    this.state = ko.observable('pause');
    this.forcedUpdateInterval = ko.observable(1000); // in ms

    // not serialized and private:
    this.startTimeInUTC = null;
    this.triggerCallbacks = [];
    this.triggerTimes = [];
    this.jsTimerHandles = [];
    this.value.subscribe(function() {
        self.parentVar.notifyValueChanged();
    });
};

// enum definitions:
GlobalVarValueTimer.states = ['pause','up','down'];

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param valueObj
 */
GlobalVarValueTimer.prototype.setValue = function(valueObj) {

};

GlobalVarValueTimer.prototype.getValue = function(currentTime) {
    // if currentTime is not provided, then use Date.now():
    currentTime = typeof currentTime === 'undefined' ? Date.now() : currentTime;
    switch (this.state()) {
        case "pause":
            return this.timerValueAtStart();
        case "up":
            return this.timerValueAtStart() + (currentTime-this.startTimeInUTC());
        case "down":
            return this.timerValueAtStart() - (currentTime-this.startTimeInUTC());
    }
};

GlobalVarValueTimer.prototype.pause = function() {
    this.updateCurrentValue();
    this.state('pause');
};

GlobalVarValueTimer.prototype.startCountdown = function() {
    this.updateCurrentValue();
    this.state('down');
};

GlobalVarValueTimer.prototype.startCountup = function() {
    this.updateCurrentValue();
    this.state('up');
};

GlobalVarValueTimer.prototype.setValue = function(timeInMs) {
    this.timerValueAtStart(timeInMs);
    this.startTimeInUTC(Date.now());
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
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(null);
    this.value.subscribe(function() {
        self.parentVar.notifyValueChanged();
    });
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param valueObj
 */
GlobalVarValueStructure.prototype.setValue = function(valueObj) {

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
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(null);
    this.value.subscribe(function() {
        self.parentVar.notifyValueChanged();
    });
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
