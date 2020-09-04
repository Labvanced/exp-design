


////////////////////  GlobalVarValueString  ///////////////////////////////////

GlobalVarValueString = function (parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable("");
    this.value.subscribe(function () {
        self.parentVar.notifyValueChanged();
    });

    // not serialized
    this.editVal = ko.observable(false)
};

GlobalVarValueString.prototype.editEntry = function () {
    this.editVal(true);
};

GlobalVarValueString.prototype.createHyperlink = function (data) {
    if (!data) {
        return null;
    }
    if (data.indexOf('</a>') != -1 || data.indexOf('http') == -1 && data.indexOf('www') == -1) {
        return data;
    }
    if (data.indexOf('www') != -1) {
        if (data.indexOf('http') == -1) {
            data = "https://" + data;
        }
    }
    return '<a href="' + data + '" target="_blank">' + data + '</a>';
}

GlobalVarValueString.prototype.convert = function (data) {
    if (data === null) {
        return null;
    }
    if ((typeof data) != "string") {
        data = String(data);
    }
    data = this.createHyperlink(data);
    return data;
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueString.prototype.setValue = function (data) {
    if (data && data.hasOwnProperty("parentVar") && typeof data.parentVar == "GlobalVar") {
        data = data.toJS();
    }
    // convert other data types to string:
    this.value(this.convert(data));
};

GlobalVarValueString.prototype.getValue = function () {
    return this.toJS();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueString.prototype.fromJS = function (data) {
    this.value(this.convert(data));
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueString.prototype.toJS = function () {
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

GlobalVarValueNumeric = function (parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(null);
    this.value.subscribe(function () {
        self.parentVar.notifyValueChanged();
    });
};

GlobalVarValueNumeric.prototype.convert = function (data) {
    if (data === null) {
        return null;
    }
    if ((typeof data) != "number") {
        return Number(data);
    }
    return data;
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueNumeric.prototype.setValue = function (data) {
    if (data === null) {
        this.value(this.convert(data));
    }
    else {
        if (data && data.hasOwnProperty("parentVar") && typeof data.parentVar == "GlobalVar") {
            data = data.toJS();
        }
        // convert other data types to numeric:
        this.value(this.convert(data));
    }

};

GlobalVarValueNumeric.prototype.getValue = function () {
    return this.toJS();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueNumeric.prototype.fromJS = function (data) {
    this.value(this.convert(data));
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueNumeric.prototype.toJS = function () {
    return this.value();
};

/**
 * return string representation of value
 * @returns {object}
 */

GlobalVarValueNumeric.prototype.toString = function () {
    if (this.value() != null) {
        return this.value().toString();
    }
    else {
        return null;
    }
};

////////////////////  GlobalVarValueFile ///////////////////////////////////

GlobalVarValueFile = function (parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable({
        name: ko.observable(null),
        guid: ko.observable(null),
        id: ko.observable(null)
    });

    this.value.subscribe(function () {
        self.parentVar.notifyValueChanged();
    });
};

GlobalVarValueFile.prototype.name = function () {
    return this.value().name();
};

GlobalVarValueFile.prototype.guid = function () {
    return this.value().guid();
};

GlobalVarValueFile.prototype.id = function () {
    return this.value().id();
};

GlobalVarValueFile.prototype.setName = function (name) {
    this.value().name(name);
    this.parentVar.notifyValueChanged();
};

GlobalVarValueFile.prototype.setGuid = function (guid) {
    this.value().guid(guid);
    this.parentVar.notifyValueChanged();
};

GlobalVarValueFile.prototype.setNameAndGuidAndId = function (name, guid, id) {
    this.value({
        name: ko.observable(name),
        guid: ko.observable(guid),
        id: ko.observable(id)
    });
};

GlobalVarValueFile.prototype.convert = function (data) {
    if (data instanceof GlobalVarValueFile) {
        return data.value()
    }
    else {
        var newValue = {
            name: ko.observable(null),
            guid: ko.observable(null),
            id: ko.observable(null)
        };

        if (data === null) {
            return newValue;
        }
        if (data.hasOwnProperty("name")) {
            newValue.name(data.name)
        }
        if (data.hasOwnProperty("guid")) {
            newValue.guid(data.guid)
        }
        if (data.hasOwnProperty("id")) {
            newValue.id(data.id)
        }
        return newValue;
    }

};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueFile.prototype.setValue = function (data) {
    if (data && data.hasOwnProperty("parentVar") && typeof data.parentVar == "GlobalVar") {
        data = data.toJS();
    }
    // convert other data types to file:
    this.value(this.convert(data));
};

GlobalVarValueFile.prototype.getValue = function () {
    return this.toJS();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueFile.prototype.fromJS = function (data) {
    this.value(this.convert(data));
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueFile.prototype.toJS = function () {
    return {
        name: this.value().name(),
        guid: this.value().guid(),
        id: this.value().id()
    };
};

/**
 * return string representation of value
 * @returns {object}
 */

GlobalVarValueFile.prototype.toString = function () {
    if (this.value() != null) {
        return this.value().toString();
    }
    else {
        return null;
    }
};

////////////////////  GlobalVarValueBoolean  ///////////////////////////////////

GlobalVarValueBoolean = function (parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(false);
    this.value.subscribe(function () {
        self.parentVar.notifyValueChanged();
    });
};

GlobalVarValueBoolean.prototype.convert = function (data) {
    if (data === null) {
        return null;
    }
    if ((typeof data) != "boolean") {
        return Boolean(data);
    }
    return data;
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueBoolean.prototype.setValue = function (data) {
    if (data && data.hasOwnProperty("parentVar") && typeof data.parentVar == "GlobalVar") {
        data = data.toJS();
    }
    this.value(this.convert(data));
};

GlobalVarValueBoolean.prototype.getValue = function () {
    return this.toJS();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueBoolean.prototype.fromJS = function (data) {
    this.value(this.convert(data));
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueBoolean.prototype.toJS = function () {
    return this.value();
};

/**
 * return string representation of value
 * @returns {object}
 */
GlobalVarValueBoolean.prototype.toString = function () {
    if (this.value() != null) {
        return this.value().toString();
    }
    else {
        return null;
    }
};

////////////////////  GlobalVarValueCategorical  ///////////////////////////////////

GlobalVarValueCategorical = function (parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(null);
    this.value.subscribe(function (val) {
        self.parentVar.notifyValueChanged();
    });
};

GlobalVarValueCategorical.prototype.convert = function (data) {
    if (data === null) {
        return null;
    }
    if ((typeof data) != "string") {
        return String(data);
    }
    return data;
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueCategorical.prototype.setValue = function (data) {
    if (data === null) {
        this.value(this.convert(data));
    }
    else {
        if (data && data.hasOwnProperty("parentVar") && typeof data.parentVar == "GlobalVar") {
            data = data.toJS();
        }
        // convert other data types to string:
        data = this.convert(data);

        if (this.parentVar.levels().indexOf(data) == -1) {
            this.value(null);
        }
        else {
            this.value(data);
        }
    }




};

GlobalVarValueCategorical.prototype.getValue = function () {
    return this.toJS();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueCategorical.prototype.fromJS = function (data) {
    this.value(this.convert(data));
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueCategorical.prototype.toJS = function () {
    return this.value();
};


/**
 * return string representation of value
 * @returns {object}
 */
GlobalVarValueCategorical.prototype.toString = function () {
    if (this.value() != null) {
        return this.value().toString();
    }
    else {
        return null;
    }
};






////////////////////  GlobalVarValueTime  ///////////////////////////////////

GlobalVarValueTime = function (parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(null);
    this.value.subscribe(function () {
        self.parentVar.notifyValueChanged();
    });
};

GlobalVarValueTime.prototype.convert = function (data) {
    if (data === null) {
        return null;
    }
    else {
        if (typeof data === 'string' || data instanceof String) {
            var indSep = data.split(":");
            if (indSep.length == 2 && parseInt(indSep[0]) >= 0 && parseInt(indSep[0]) <= 23 && parseInt(indSep[1]) >= 0 && parseInt(indSep[1]) <= 59) {
                return data;
            }
            else if (data.length == 2 && parseInt(data) >= 0 && parseInt(data) <= 23) {
                var hour = parseInt(data);
                return hour + ":00";
            }
            else {
                return null;
            }
        }
        else {
            return null; // TODO: handle other formats than string
        }
    }
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueTime.prototype.setValue = function (data) {
    if (data === null) {
        this.value(this.convert(data));
    }
    else {
        if (data && data.hasOwnProperty("parentVar") && typeof data.parentVar == "GlobalVar") {
            data = data.toJS();
        }
        this.value(this.convert(data));
    }

};

GlobalVarValueTime.prototype.getValue = function () {
    return this.toJS();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueTime.prototype.fromJS = function (data) {
    this.value(this.convert(data));
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueTime.prototype.toJS = function () {
    return this.value();
};


/**
 * return string representation of value
 * @returns {object}
 */
GlobalVarValueTime.prototype.toString = function () {
    if (this.value() != null) {
        return this.value().toString();
    }
    else {
        return null;
    }
};






////////////////////  GlobalVarValueDatetime  ///////////////////////////////////

GlobalVarValueDatetime = function (parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(null);
    this.value.subscribe(function () {
        self.parentVar.notifyValueChanged();
    });
};

GlobalVarValueDatetime.prototype.convert = function (data) {
    if (data === null || data === "null") {
        return null;
    }
    data = new Date(data);
    return data;
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueDatetime.prototype.setValue = function (data) {
    if (data === null) {
        this.value(this.convert(data));
    }
    else {
        if (data && data.hasOwnProperty("parentVar") && typeof data.parentVar == "GlobalVar") {
            data = data.toJS();
        }
        if (data.hasOwnProperty("value")) {
            data = null;
        }
        this.value(this.convert(data));
    }

};

GlobalVarValueDatetime.prototype.getValue = function () {
    return this.toJS();
};


/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueDatetime.prototype.fromJS = function (data) {
    this.value(this.convert(data));
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueDatetime.prototype.toJS = function () {
    if (this.value() != null) { // check for invalid Date object
        if (this.value() instanceof Date && !isNaN(this.value().valueOf())) {
            this.value(this.convert(this.value()));
            return this.value().toISOString().substring(0, 10)
        }
        else {
            return this.value();
        }
    }
    else {
        return null;
    }

};

/**
 * return string representation of value
 * @returns {object}
 */
GlobalVarValueDatetime.prototype.toString = function () {
    if (this.value() != null) {
        return this.value().toString().substring(0, 10);
    }
    else {
        return null;
    }
};

////////////////////  GlobalVarValueTimer  ///////////////////////////////////

GlobalVarValueTimer = function (parentVar) {
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
    this.value.subscribe(function () {
        self.parentVar.notifyValueChanged();
    });
};

// enum definitions:
GlobalVarValueTimer.states = ['pause', 'up', 'down'];

GlobalVarValueTimer.prototype.setValue = function (timeInMs) {
    if (timeInMs === null) {
        timeInMs = 0;
    }
    timeInMs = parseInt(timeInMs);
    this.timerValueAtStart = timeInMs;
    this.value(timeInMs);
    this.startTimeInUTC = Date.now();
    this.updateInterval();
    this.updateTimeout();
};

GlobalVarValueTimer.prototype.getValue = function (currentTime) {
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
            return this.timerValueAtStart + (currentTime - this.startTimeInUTC);
        case "down":
            return this.timerValueAtStart - (currentTime - this.startTimeInUTC);
    }
};

GlobalVarValueTimer.prototype.pause = function () {
    this.updateCurrentValue();
    this.state('pause');
    this.updateInterval();
    this.updateTimeout();
};

GlobalVarValueTimer.prototype.startCountdown = function () {
    this.updateCurrentValue();
    this.state('down');
    this.updateInterval();
    this.updateTimeout();
};

GlobalVarValueTimer.prototype.startCountup = function () {
    this.updateCurrentValue();
    this.state('up');
    this.updateInterval();
    this.updateTimeout();
};

GlobalVarValueTimer.prototype.updateCurrentValue = function () {
    var curTime = Date.now();
    var newVal = this.getValue(curTime);
    this.value(newVal);
    this.timerValueAtStart = newVal;
    this.startTimeInUTC = curTime;
};

GlobalVarValueTimer.prototype.updateInterval = function () {
    var self = this;
    if (this.jsIntervalHandle) {
        clearInterval(this.jsIntervalHandle);
        this.jsIntervalHandle = null;
    }
    this.jsIntervalHandle = setInterval(function () {
        self.updateCurrentValue();
    }, this.forcedUpdateInterval());
};

GlobalVarValueTimer.prototype.getTimeUntilValueReached = function (targetValue) {

};

GlobalVarValueTimer.prototype.updateTimeout = function () {

    var self = this;

    // remove old timeout callback
    if (this.jsTimeoutHandle) {
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
        this.nextTriggerIdx = this.binarySearchForTriggerTime(currentTimerVal, false);
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
        timeUntilNextTrigger = nextTriggerValue - currentTimerVal;
    }
    else { // "down"
        this.nextTriggerIdx = this.binarySearchForTriggerTime(currentTimerVal, true);
        this.nextTriggerIdx--;
        if (this.nextTriggerIdx < 0) {
            // no more triggers below this value
            console.log("no more triggers in this timer");
            return;
        }
        nextTriggerValue = this.triggerTimes[this.nextTriggerIdx];
        timeUntilNextTrigger = currentTimerVal - nextTriggerValue;
    }
    console.log("this.nextTriggerIdx = " + this.nextTriggerIdx + " nextTriggerValue = " + nextTriggerValue + " timeUntilNextTrigger = " + timeUntilNextTrigger);

    // add new timeout callback:
    this.jsTimeoutHandle = setTimeout(function () {
        console.log("trigger timer idx " + self.nextTriggerIdx);
        self.triggerCallbacks[self.nextTriggerIdx]();
        self.updateTimeout();
    }, timeUntilNextTrigger);
};

GlobalVarValueTimer.prototype.addTriggerCallback = function (triggerCallback, triggerTime) {
    //this.unittest();
    var idx = this.binarySearchForTriggerTime(triggerTime);
    this.triggerCallbacks.splice(idx, 0, triggerCallback);
    this.triggerTimes.splice(idx, 0, triggerTime);
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
GlobalVarValueTimer.prototype.binarySearchForTriggerTime = function (newTimeToInsert, searchSmallest) {
    var len = this.triggerTimes.length;
    if (len === 0) {
        return 0;
    }
    if (this.triggerTimes[len - 1] < newTimeToInsert) {
        return len;
    }

    var minIndex = 0;
    var maxIndex = len - 1;
    var middleIndex;
    var currentElement;

    while (true) {
        middleIndex = Math.floor((minIndex + maxIndex) / 2);
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
                while (middleIndex > 0 && this.triggerTimes[middleIndex - 1] === newTimeToInsert) {
                    middleIndex--;
                }
                return middleIndex;
            }
            else {
                while (middleIndex < len && this.triggerTimes[middleIndex + 1] === newTimeToInsert) {
                    middleIndex++;
                }
                return middleIndex;
            }
        }
    }
    return middleIndex;
};

GlobalVarValueTimer.prototype.unittest = function () {
    this.triggerTimes = [3, 8, 9, 9, 9, 11];
    if (this.binarySearchForTriggerTime(2, true) != 0) console.error("failed 2");
    if (this.binarySearchForTriggerTime(2, false) != 0) console.error("failed 2");
    if (this.binarySearchForTriggerTime(9, true) != 2) console.error("failed 9");
    if (this.binarySearchForTriggerTime(9, false) != 4) console.error("failed 9");
    if (this.binarySearchForTriggerTime(8, true) != 1) console.error("failed 8");
    if (this.binarySearchForTriggerTime(8, false) != 1) console.error("failed 8");
    if (this.binarySearchForTriggerTime(10, true) != 5) console.error("failed 10");
    if (this.binarySearchForTriggerTime(10, false) != 5) console.error("failed 10");
    if (this.binarySearchForTriggerTime(13, true) != 6) console.error("failed 13");
    if (this.binarySearchForTriggerTime(13, false) != 6) console.error("failed 13");
};

GlobalVarValueTimer.prototype.toString = function () {
    return this.value();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueTimer.prototype.fromJS = function (data) {
    this.setValue(data);
    this.pause();
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueTimer.prototype.toJS = function () {
    return this.value();
};

////////////////////  GlobalVarValueArray  ///////////////////////////////////

GlobalVarValueArray = function (parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observableArray([]);
    this.value.subscribe(function () {
        self.parentVar.notifyValueChanged();
    });
};

GlobalVarValueArray.prototype.convert = function (data) {
    var self = this;
    if (data === null) {
        return [];
    }

    if (data instanceof Array) {
        var arrValues = jQuery.map(data, function (scalar) {
            var newDatType = self.parentVar.createScalarValueFromDataType();
            self.parentVar.tmpDisableTimeseriesRec = true;
            newDatType.setValue(scalar);
            self.parentVar.tmpDisableTimeseriesRec = false;
            return newDatType;
        });
    }
    else if (data instanceof GlobalVarValueArray) {
        var arrValues = jQuery.map(data.value(), function (scalar) {
            var newDatType = self.parentVar.createScalarValueFromDataType();
            self.parentVar.tmpDisableTimeseriesRec = true;
            newDatType.setValue(scalar);
            self.parentVar.tmpDisableTimeseriesRec = false;
            return newDatType;
        });
    }
    else {
        var newDatType = self.parentVar.createScalarValueFromDataType();
        self.parentVar.tmpDisableTimeseriesRec = true;
        newDatType.setValue(data);
        self.parentVar.tmpDisableTimeseriesRec = false;
        var arrValues = [newDatType];
    }
    return arrValues;
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueArray.prototype.getValueAt = function (idx) {
    return this.value()[idx - 1];
};

GlobalVarValueArray.prototype.getValues = function () {
    return this.getValue();
};


GlobalVarValueArray.prototype.setValueAt = function (idx, val) {
    this.value()[idx].value(val);
};


/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueArray.prototype.pushValue = function (scalarData) {
    var newScalar = this.parentVar.createScalarValueFromDataType();
    newScalar.setValue(scalarData);
    this.value.push(newScalar);
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueArray.prototype.setValue = function (data) {
    if (data && data.hasOwnProperty("parentVar") && typeof data.parentVar == "GlobalVar") {
        data = data.toJS();
    }
    this.value(this.convert(data));
};

GlobalVarValueArray.prototype.getValue = function () {
    return this.toJS();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueArray.prototype.fromJS = function (data) {
    this.value(this.convert(data));
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueArray.prototype.toJS = function () {
    var self = this;
    var arrValuesJS = [];
    this.value().forEach(function (scalar) {
        arrValuesJS.push(scalar.toJS());
    });
    return arrValuesJS;
};

/**
 * return string representation of value
 * @returns {object}
 */

GlobalVarValueArray.prototype.toString = function () {
    if (this.value() != null) {
        var arrValuesString = jQuery.map(this.value(), function (scalar) {
            return scalar.toString();
        });
        return arrValuesString.join();
    }
    else {
        return null;
    }
};



////////////////////  GlobalVarValueDataFrame  ///////////////////////////////////

GlobalVarValueDataFrame = function (parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observableArray([]);
    this.value.subscribe(function () {
        self.parentVar.notifyValueChanged();
    });
};

GlobalVarValueDataFrame.prototype.convert = function (data) {
    var self = this;
    if (data === null) {
        return [];
    }

    if (data instanceof Array) {
        var arrValues = jQuery.map(data, function (globalVar) {
            return self.createSubVar().fromJS(globalVar);
        });
        return arrValues
    } else {
        return []
    }

};

GlobalVarValueDataFrame.prototype.getColumnByIndex = function (col_idx) {
    return this.value()[col_idx].value();
};

GlobalVarValueDataFrame.prototype.getColumnByName = function (col_name) {
    var foundSubVar = null;
    jQuery.each(this.value(), function (index, elem) {
        if (elem.name() == col_name) {
            foundSubVar = elem;
        }
    });
    return foundSubVar;
};

GlobalVarValueDataFrame.prototype.isInt = function (value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueDataFrame.prototype.getValueAt = function (rowIdx, colIdxOrName) {
    // first find column:
    var colVar = null;
    if (this.isInt(colIdxOrName)) {
        var colIdx = parseInt(Number(colIdxOrName))
        colVar = this.value()[colIdx - 1];
    }

    // if not found by index, try by name
    if (!colVar) {
        colVar = this.getColumnByName(colIdxOrName);
    }

    if (colVar) {
        return colVar.value().getValueAt(rowIdx);
    }
    else {
        return null;
    }
};

GlobalVarValueDataFrame.prototype.getValues = function () {
    return this.getValue();
};


GlobalVarValueDataFrame.prototype.setValueAt = function (idx, val) {
    this.value()[idx].value(val);
};


/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueDataFrame.prototype.pushValue = function (scalarData) {
    var newSubVar = this.createSubVar();
    newSubVar.setValue(scalarData);
    this.value.push(newSubVar);
};

/**
 * create a new sub varibale
 */
GlobalVarValueDataFrame.prototype.createSubVar = function () {
    return new GlobalVar(this.parentVar.expData);
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueDataFrame.prototype.setValue = function (data) {
    if (data && data.hasOwnProperty("parentVar") && typeof data.parentVar == "GlobalVar") {
        data = data.toJS();
    }
    this.parentVar.tmpDisableTimeseriesRec = true;
    this.value([]);
    this.parentVar.tmpDisableTimeseriesRec = false;
    this.value(this.convert(data));
};

GlobalVarValueDataFrame.prototype.getValue = function () {
    return this.toJS();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueDataFrame.prototype.fromJS = function (data) {
    this.value(this.convert(data));
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueDataFrame.prototype.toJS = function () {
    var self = this;
    var arrValuesJS = [];
    this.value().forEach(function (globalVar) {
        arrValuesJS.push(globalVar.toJS());
    });
    return arrValuesJS;
};

/**
 * return string representation of value
 * @returns {object}
 */

GlobalVarValueDataFrame.prototype.toString = function () {
    if (this.value() != null) {
        var arrValuesString = jQuery.map(this.value(), function (scalar) {
            return scalar.toString();
        });
        return arrValuesString.join();
    }
    else {
        return null;
    }
};




////////////////////  GlobalVarValueUndefined  ///////////////////////////////////

GlobalVarValueUndefined = function (parentVar) {
    var self = this;
    this.parentVar = parentVar;
    this.value = ko.observable(null);
    this.value.subscribe(function () {
        self.parentVar.notifyValueChanged();
    });
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param data
 */
GlobalVarValueUndefined.prototype.setValue = function (data) {
    this.value(data);
};

GlobalVarValueUndefined.prototype.getValue = function () {
    return this.toJS();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVarValueUndefined.prototype.fromJS = function (data) {
    this.value(data);
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarValueUndefined.prototype.toJS = function () {
    return this.value();
};

/**
 * return string representation of value
 * @returns {object}
 */
GlobalVarValueUndefined.prototype.toString = function () {
    if (this.value() != null) {
        return this.value().toString();
    }
    else {
        return null;
    }
};
