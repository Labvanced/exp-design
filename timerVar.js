// � by Caspar Goeke and Holger Finger

// define Date.now for backwards compatibility to IE8:
if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

/**
 * This class is a specific type of GlobalVar, which can automatically count up or down and trigger events when the
 * timer reaches a certain value.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var GlobalVarTimer = function (parentGlobalVar) {
    this.parentGlobalVar = parentGlobalVar;

    // serialized:
    this.state = 'pause';
    this.timerValueAtStart = 0;
    this.forcedUpdateInterval = 1000; // in ms

    // not serialized and private:
    this.startTimeInUTC = null;
    this.triggerCallbacks = [];
    this.triggerTimes = [];
    this.jsTimerHandles = [];
};

// enum definitions:
GlobalVarTimer.states = ['pause','up','down'];

/**
 * private function:
 */
GlobalVarTimer.prototype.updateCurrentValue = function() {
    var curTime = Date.now();
    var newVal = this.getValue(curTime);
    this.timerValueAtStart = newVal;
    this.startTimeInUTC = curTime;
};

/**
 * private function to update internal js timers
 */
// GlobalVarTimer.prototype.updateTriggerCallbacks = function(currentTime) {
//
//     // if currentTime is not provided, then use Date.now():
//     currentTime = typeof currentTime === 'undefined' ? Date.now() : currentTime;
//
//     var self = this;
//     for (var k=0; k< this.triggerTimes.length; k++) {
//         if (this.jsTimerHandles[k]) {
//             clearTimeout(this.jsTimerHandles[k]);
//         }
//         if (this.state != 'pause') {
//             var timeDiff = this.timerValueAtStart - this.triggerTimes[k];
//             if (this.state == 'up') {
//                 timeDiff = - timeDiff;
//             }
//             var triggerTimenUTC = this.startTimeInUTC + timeDiff;
//             this.jsTimerHandles[k] = setTimeout(function () {
//                 self.
//             }, triggerTimeInUTC);
//         }
//     }
// };

GlobalVarTimer.prototype.pause = function() {
    this.updateCurrentValue();
    this.state('pause');
};

GlobalVarTimer.prototype.startCountdown = function() {
    this.updateCurrentValue();
    this.state('down');
};

GlobalVarTimer.prototype.startCountup = function() {
    this.updateCurrentValue();
    this.state('up');
};

GlobalVarTimer.prototype.setValue = function(timeInMs) {
    this.timerValueAtStart(timeInMs);
    this.startTimeInUTC(Date.now());
};

GlobalVarTimer.prototype.getValue = function(currentTime) {
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

GlobalVarTimer.prototype.addTimerReachedCallback = function(onValueReached) {

};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
GlobalVarTimer.prototype.setPointers = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVarTimer}
 */
GlobalVarTimer.prototype.fromJS = function(data) {
    this.state(data.state);
    this.timerValueAtStart(data.timerValueAtStart);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVarTimer.prototype.toJS = function() {
    return {
        state: this.state(),
        timerValueAtStart: this.timerValueAtStart()
    };
};

