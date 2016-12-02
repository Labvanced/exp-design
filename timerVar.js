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
var TimerVar = function (expData) {
    this.expData = expData;

    // serialized:
    this.id = ko.observable(guid());
    this.name = ko.observable("newVariable");
    this.type = "TimerVar";

    // not serialized and private:
    this.state = 'pause';
    this.timerValueAtStart = null;
    this.startTimeInUTC = null;
    this.triggerCallbacks = [];
    this.triggerTimes = [];
    this.jsTimerHandles = [];
};

// enum definitions:
TimerVar.states = ['pause','up','down'];

/**
 * private function:
 */
TimerVar.prototype.updateCurrentValue = function() {
    var curTime = Date.now();
    var newVal = this.getValue(curTime);
    this.timerValueAtStart = newVal;
    this.startTimeInUTC = curTime;
};

/**
 * private function to update internal js timers
 */
// TimerVar.prototype.updateTriggerCallbacks = function(currentTime) {
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

TimerVar.prototype.pause = function() {
    this.updateCurrentValue();
    this.state('pause');
};

TimerVar.prototype.startCountdown = function() {
    this.updateCurrentValue();
    this.state('down');
};

TimerVar.prototype.startCountup = function() {
    this.updateCurrentValue();
    this.state('up');
};

TimerVar.prototype.setValue = function(timeInMs) {
    this.timerValueAtStart(timeInMs);
    this.startTimeInUTC(Date.now());
};

TimerVar.prototype.getValue = function(currentTime) {
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

TimerVar.prototype.addTimerReachedCallback = function(onValueReached) {

};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TimerVar.prototype.setPointers = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TimerVar}
 */
TimerVar.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TimerVar.prototype.toJS = function() {
    return {
        id: this.id(),
        name: this.name(),
        type: this.type
    };
};

