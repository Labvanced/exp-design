


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


/**
 * return string representation of value
 * @returns {object}
 */

GlobalVarValueString.prototype.toString = function () {
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
    // convert other data types to numeric:
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

/**
 * return string representation of value
 * @returns {object}
 */

GlobalVarValueNumeric.prototype.toString = function () {
    if(this.value() !== null){
        return this.value().toString();
    }else{
        return null;
    }
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

/**
 * return string representation of value
 * @returns {object}
 */

GlobalVarValueBoolean.prototype.toString = function () {
    if(this.value() !== null){
        return this.value().toString();
    }else{
        return null;
    }
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
    this.forcedUpdateInterval = ko.observable(50); // in ms

    // not serialized and private:
    this.startTimeInUTC = null;
    this.timerValueAtStart = null;
    this.triggerCallbacks = [];
    this.triggerTimes = [];
    this.jsIntervalHandle = null;
    this.jsTimeoutHandle = null;
    this.value.subscribe(function() {
        self.parentVar.notifyValueChanged();
    });
};

// enum definitions:
GlobalVarValueTimer.states = ['pause','up','down'];

GlobalVarValueTimer.prototype.setValue = function(timeInMs) {
    timeInMs = parseInt(timeInMs);
    this.timerValueAtStart = timeInMs;
    this.value(timeInMs);
    this.startTimeInUTC = Date.now();
    this.updateInterval();
    this.updateTimeout();
};

GlobalVarValueTimer.prototype.getValue = function(currentTime) {
    // initialize timerValueAtStart if not done yet:
    if (this.timerValueAtStart === null) {
        this.timerValueAtStart = this.value();
    }

    // if currentTime is not provided, then use Date.now():
    var currentTime = typeof currentTime === 'undefined' ? Date.now() : currentTime;
    switch (this.state()) {
        case "pause":
            return this.timerValueAtStart;
        case "up":
            return this.timerValueAtStart + (currentTime-this.startTimeInUTC);
        case "down":
            return this.timerValueAtStart - (currentTime-this.startTimeInUTC);
    }
};

GlobalVarValueTimer.prototype.pause = function() {
    this.updateCurrentValue();
    this.state('pause');
    this.updateInterval();
    this.updateTimeout();
};

GlobalVarValueTimer.prototype.startCountdown = function() {
    this.updateCurrentValue();
    this.state('down');
    this.updateInterval();
    this.updateTimeout();
};

GlobalVarValueTimer.prototype.startCountup = function() {
    this.updateCurrentValue();
    this.state('up');
    this.updateInterval();
    this.updateTimeout();
};

GlobalVarValueTimer.prototype.updateCurrentValue = function() {
    var curTime = Date.now();
    var newVal = this.getValue(curTime);
    this.value(newVal);
    this.timerValueAtStart = newVal;
    this.startTimeInUTC = curTime;
};

GlobalVarValueTimer.prototype.updateInterval = function() {
    var self = this;
    if (this.jsIntervalHandle){
        clearInterval(this.jsIntervalHandle);
        this.jsIntervalHandle = null;
    }
    this.jsIntervalHandle = setInterval(function() {
        self.updateCurrentValue();
    }, this.forcedUpdateInterval());
};

GlobalVarValueTimer.prototype.getTimeUntilValueReached = function(targetValue) {

};

GlobalVarValueTimer.prototype.updateTimeout = function() {

    var self = this;

    // remove old timeout callback
    if (this.jsTimeoutHandle){
        clearTimeout(this.jsTimeoutHandle);
        this.jsTimeoutHandle = null;
    }

    if (this.state() === "pause") {
        console.log("timer not active");
        return;
    }

    if (this.triggerTimes.length === 0) {
        return;
    }

    // calculate which is the next trigger:
    var curTime = Date.now();
    var currentTimerVal = this.getValue(curTime);
    var nextTriggerValue = null;
    var timeUntilNextTrigger = null;
    if (this.state() === "up") {
        this.nextTriggerIdx = this.binarySearchForTriggerTime(currentTimerVal,false);
        if (this.triggerTimes[this.nextTriggerIdx] === currentTimerVal) {
            // do not trigger if the value exactly matches:
            this.nextTriggerIdx++;
        }
        if (this.nextTriggerIdx >= this.triggerTimes.length) {
            console.log("no more triggers in this timer");
            // no more triggers above this value
            return;
        }
        nextTriggerValue = this.triggerTimes[this.nextTriggerIdx];
        timeUntilNextTrigger = nextTriggerValue-currentTimerVal;
    }
    else { // "down"
        this.nextTriggerIdx = this.binarySearchForTriggerTime(currentTimerVal,true);
        this.nextTriggerIdx--;
        if (this.nextTriggerIdx < 0) {
            // no more triggers below this value
            console.log("no more triggers in this timer");
            return;
        }
        nextTriggerValue = this.triggerTimes[this.nextTriggerIdx];
        timeUntilNextTrigger = currentTimerVal-nextTriggerValue;
    }
    console.log("this.nextTriggerIdx = "+this.nextTriggerIdx+" nextTriggerValue = "+nextTriggerValue+" timeUntilNextTrigger = " + timeUntilNextTrigger);

    // add new timeout callback:
    this.jsTimeoutHandle = setTimeout(function () {
        console.log("trigger timer idx "+self.nextTriggerIdx);
        self.triggerCallbacks[self.nextTriggerIdx]();
        self.updateTimeout();
    }, timeUntilNextTrigger);
};

GlobalVarValueTimer.prototype.addTriggerCallback = function (triggerCallback, triggerTime) {
    //this.unittest();
    var idx = this.binarySearchForTriggerTime(triggerTime);
    this.triggerCallbacks.splice(idx,0,triggerCallback);
    this.triggerTimes.splice(idx,0,triggerTime);
    this.updateTimeout();
};

GlobalVarValueTimer.prototype.removeTriggerCallback = function (triggerCallback) {
    var idx = this.triggerCallbacks.indexOf(triggerCallback);
    this.triggerCallbacks.splice(idx);
    this.triggerTimes.splice(idx);
    this.updateTimeout();
};

/**
 *
 * @param newTimeToInsert
 * @param searchSmallest {boolean} - if array is [3, 8, 9, 9, 9, 11] then
 *              binarySearchForTriggerTime(2,true) returns 0
 *              binarySearchForTriggerTime(2,false) returns 0
 *
 *              binarySearchForTriggerTime(8,true) returns 1
 *              binarySearchForTriggerTime(8,false) returns 1
 *
 *              binarySearchForTriggerTime(9,true) returns 2
 *              binarySearchForTriggerTime(9,false) returns 4
 *
 *              binarySearchForTriggerTime(10,true) returns 5
 *              binarySearchForTriggerTime(10,false) returns 5
 *
 *              binarySearchForTriggerTime(13,true) returns 6
 *              binarySearchForTriggerTime(13,false) returns 6
 * @returns {*}
 */
GlobalVarValueTimer.prototype.binarySearchForTriggerTime = function(newTimeToInsert, searchSmallest) {
    var len = this.triggerTimes.length;
    if (len === 0){
        return 0;
    }
    if (this.triggerTimes[len-1] < newTimeToInsert){
        return len;
    }

    var minIndex = 0;
    var maxIndex = len - 1;
    var middleIndex;
    var currentElement;

    while (true) {
        middleIndex = Math.floor((minIndex + maxIndex)/2);
        currentElement = this.triggerTimes[middleIndex];

        if (currentElement < newTimeToInsert) {
            minIndex = middleIndex + 1;
            if (minIndex > maxIndex) {
                return middleIndex + 1;
            }
        }
        else if (currentElement > newTimeToInsert) {
            maxIndex = middleIndex - 1;
            if (minIndex > maxIndex) {
                return middleIndex;
            }
        }
        else {
            // found exact match!
            if (searchSmallest) {
                while (middleIndex>0 && this.triggerTimes[middleIndex-1] === newTimeToInsert) {
                    middleIndex--;
                }
                return middleIndex;
            }
            else {
                while (middleIndex<len && this.triggerTimes[middleIndex+1] === newTimeToInsert) {
                    middleIndex++;
                }
                return middleIndex;
            }
        }
    }
    return middleIndex;
};

GlobalVarValueTimer.prototype.unittest = function() {
    this.triggerTimes = [3, 8, 9, 9, 9, 11];
    if(this.binarySearchForTriggerTime(2,true) != 0) console.error("failed 2");
    if(this.binarySearchForTriggerTime(2,false) != 0) console.error("failed 2");
    if(this.binarySearchForTriggerTime(9,true) != 2) console.error("failed 9");
    if(this.binarySearchForTriggerTime(9,false) != 4) console.error("failed 9");
    if(this.binarySearchForTriggerTime(8,true) != 1) console.error("failed 8");
    if(this.binarySearchForTriggerTime(8,false) != 1) console.error("failed 8");
    if(this.binarySearchForTriggerTime(10,true) != 5) console.error("failed 10");
    if(this.binarySearchForTriggerTime(10,false) != 5) console.error("failed 10");
    if(this.binarySearchForTriggerTime(13,true) != 6) console.error("failed 13");
    if(this.binarySearchForTriggerTime(13,false) != 6) console.error("failed 13");
};

GlobalVarValueTimer.prototype.toString = function () {
    return this.value();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueTimer.prototype.fromJS = function(data) {
    this.setValue(data);
    this.pause();
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
