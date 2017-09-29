// Copyright by Scicovery GmbH



/////////////////////////////////////////////////  ActionRecord  ///////////////////////////////////////////////////

/**
 * This action can record values (i.e. elementTag or reactiontime) into variables and sends them to the server.
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionRecord = function(event) {
    this.event = event;
    this.specialRecs = this.event.trigger().getParameterSpec();
    this.selectedRecordings =  ko.observableArray([]);
};

ActionRecord.prototype.type = "ActionRecord";
ActionRecord.prototype.label = "Save Response or Property";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionRecord.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionRecord.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'recording variable');
};

/**
 * add a new recording to the list.
 * @param {string} type - the type of the recording, such as "elementTag" or "reactionTime"
 */
ActionRecord.prototype.addRecording = function(type){
    var self = this;
    var newRec={
        recType: type,
        variable :ko.observable({
            isRecorded: ko.observable(true)
        }),
        tmpRecState: null
    };
    newRec.variable.subscribe(function(oldValue) {
        newRec.tmpRecState = oldValue.isRecorded();
    }, null, "beforeChange");

    newRec.variable.subscribe(function(oldValue) {
        oldValue.isRecorded(newRec.tmpRecState);
    }, this);

    this.selectedRecordings.push(newRec);


};

/**
 * This function is called when the parent event was triggered and the requirements are true. It creates the RecData and
 * sends them to the server.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionRecord.prototype.run = function(triggerParams) {
    var self = this;
    var selectedRecs = this.selectedRecordings();
    for (i = 0; i < selectedRecs.length; i++) {
        var name = selectedRecs[i].recType;
        var varToSave = selectedRecs[i].variable();
        var val;
        switch (name) {
            // mouse events
            case "Stimulus Name":
                val = triggerParams[0];
                break;
            case "Time From Stimulus Onset":  // change to onset of stimulus
                val = triggerParams[1];
                break;
            case "Stimulus Info":  // change to onset of stimulus
                val = triggerParams[2];
                break;
            case "Stimulus Visibility":
                val = triggerParams[3];
                break;
            case "Stimulus X-Position":
                val = triggerParams[4];
                break;
            case "Stimulus Y-Position":
                val = triggerParams[5];
                break;
            case "Stimulus Width":
                val = triggerParams[6];
                break;
            case "Stimulus Height":
                val = triggerParams[7];
                break;
            // keyboard events
            case "Id of Key":
                val = triggerParams[0];
                break;
            // frame properties
            case "Time From Frame Onset":
                val = triggerParams[1];
                break;
            // mouse properties
            case "Mouse X-Position":
                val = self.event.trigger().mouseX;
                break;
            // mouse properties
            case "Mouse Y-Position":
                val = self.event.trigger().mouseX;
                break;
        }

        varToSave.value().value(val);
    }


};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionRecord.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecord.prototype.setPointers = function(entitiesArr) {
    var i;
    var globVar;

    var selectedRecordings = this.selectedRecordings();
    for (i = 0; i<selectedRecordings.length; i++){
        if (selectedRecordings[i].variable()) {
            globVar = entitiesArr.byId[selectedRecordings[i].variable()];
            selectedRecordings[i].variable(globVar);
            this.setVariableBackRef(globVar);
        }
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecord.prototype.reAddEntities = function(entitiesArr) {

    var i;
    var selectedRec = this.selectedRecordings();
    for (i = 0; i<selectedRec.length; i++){
        if (selectedRec[i].variable()) {
            if (!entitiesArr.byId.hasOwnProperty(selectedRec[i].variable().id())) {
                entitiesArr.push(selectedRec[i].variable());
            }
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionRecord}
 */
ActionRecord.prototype.fromJS = function(data) {

    var i, tmp;


    var selectedRecordings = [];
    for (i = 0; i < data.selectedRecordings.length; i++) {
        tmp = data.selectedRecordings[i];
        selectedRecordings.push({
            recType: tmp.recType,
            variable: ko.observable(tmp.variable),
        });
    }
    this.selectedRecordings(selectedRecordings);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionRecord.prototype.toJS = function() {
    var rec, varId, i;


    var selectedRecordings = [];
    var selectedRec = this.selectedRecordings();
    for (i = 0; i<selectedRec.length; i++){
        rec = selectedRec[i];
        varId = null;
        if (rec.variable()) {
            varId = rec.variable().id();
        }
        selectedRecordings.push({
            recType: rec.recType,
            variable:  varId
        });
    }

    return {
        type: this.type,
        selectedRecordings: selectedRecordings
    };
};


////////////////////////////////////////  ActionSetElementProp  ///////////////////////////////////////////////////

/**
 * This action changes properties of a contentElement.
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionSetElementProp = function(event) {
    this.event = event;
    this.target = ko.observable(null);
    this.changes = ko.observableArray([]);
    this.animate = ko.observable(false);
    this.animationTime=ko.observable(0);
};


ActionSetElementProp.prototype.type = "ActionSetElementProp";
ActionSetElementProp.prototype.label = "Set Stimulus Property";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionSetElementProp.prototype.isValid = function(){
    return true;
};

/**
 * adds a new property that shall be changed.
 */
ActionSetElementProp.prototype.addProperty = function() {
    var newChange = new ActionSetElementPropChange(this);
    this.changes.push(newChange);
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSetElementProp.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, false, true, 'Action Set Element Prop');
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It reads out the desired
 * changes and applies them to the properties.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */

ActionSetElementProp.prototype.run = function(triggerParams) {

    var changes = this.changes();
    var target = this.target();
    for (var i = 0; i <changes.length; i++){
        var property =  changes[i].property();
        var operatorType =  changes[i].operatorType();
        var changeType =  changes[i].changeType();
        var variable = changes[i].variable();

        // make sure to calculate on numeric
        var value =  changes[i].value();

        //var oldValue = target[property]();
        var oldValue = target.modifier().selectedTrialView[property]();

        if (typeof oldValue  === 'string'){
            oldValue = Number(oldValue);
        }
        if (typeof value  === 'string'){
            value = Number(value);
        }

        var newValue;
        var changeValue;

        if (changeType == 'value'){
            changeValue = value;
        }
        else if (changeType == '%'){
            changeValue = (oldValue * (value/100));
        }
        else if (changeType == 'variable'){
            changeValue = parseFloat(variable.value().value());
        }

        if (operatorType== '='){
            newValue = changeValue;
        }
        else if (operatorType== '+'){
            newValue = oldValue + changeValue;
        }
        else if (operatorType== '-'){
            newValue = oldValue - changeValue;
        }
        else if (operatorType== '*'){
            newValue = oldValue * changeValue;
        }
        else if (operatorType== '/'){
            newValue = oldValue / changeValue;
        }

        target.modifier().selectedTrialView[property](newValue);
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetElementProp.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetElementProp.prototype.setPointers = function(entitiesArr) {
    var target = entitiesArr.byId[this.target()];
    this.target(target);

    var changes = this.changes();
    for (var i=0; i<changes.length; i++) {
        changes[i].setPointers(entitiesArr);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetElementProp.prototype.reAddEntities = function(entitiesArr) {
    var changes = this.changes();
    for (var i = 0; i <changes.length; i++) {
        var variable = changes[i].variable();
        if (variable) {
            if (!entitiesArr.byId.hasOwnProperty(variable.id())) {
                entitiesArr.push(variable);
            }
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSetElementProp}
 */
ActionSetElementProp.prototype.fromJS = function(data) {
    this.animate(data.animate);
    this.animationTime(data.animationTime);
    this.target(data.target);

    var changes = [];
    for (var i = 0 ;i <data.changes.length;i++){
        var tmp = data.changes[i];
        var obj = new ActionSetElementPropChange(this);
        obj.fromJS(tmp);
        changes.push(obj);
    }
    this.changes(changes);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSetElementProp.prototype.toJS = function() {

    var changes= [];
    var origChanges = this.changes();
    for (var i = 0; i<origChanges.length; i++){
        var obj = origChanges[i].toJS();
        changes.push(obj);
    }

    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }

    return {
        type: this.type,
        target: targetId,
        animate: this.animate(),
        animationTime:this.animationTime,
        changes: changes
    };
};


////////////////////////////////////////  ActionSetElementPropChange  ///////////////////////////////////////////////////

var ActionSetElementPropChange = function(parentAction) {
    this.parentAction = parentAction;

    this.property = ko.observable(null);
    this.operatorType = ko.observable(null);
    this.changeType = ko.observable(null);
    this.value = ko.observable(0);
    this.variable = ko.observable(null);
};

ActionSetElementPropChange.prototype.operatorTypes = ["=", "+", "-", "*", "/"];
ActionSetElementPropChange.prototype.changeTypes =  ["value", "%", "variable"];

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetElementPropChange.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

ActionSetElementPropChange.prototype.setPointers = function(entitiesArr) {
    if (this.changeType() == "variable") {
        var varId = this.variable();
        var globVar = entitiesArr.byId[varId];
        if (globVar) {
            this.variable(globVar);
            this.parentAction.setVariableBackRef(globVar);
        }
        else {
            this.variable(null);
        }
    }
    else {
        this.variable(null);
    }
};

ActionSetElementPropChange.prototype.fromJS = function(data) {
    this.property(data.property);
    this.operatorType(data.operatorType);
    this.changeType(data.changeType);
    this.value(data.value);
    if (data.variable) {
        this.variable(data.variable);
    }
};

ActionSetElementPropChange.prototype.toJS = function() {
    var variable = this.variable();
    if (variable) {
        variable = variable.id();
    }

    return {
        property: this.property(),
        operatorType: this.operatorType(),
        changeType: this.changeType(),
        value: this.value(),
        variable: variable
    };
};




////////////////////////////////////////  ActionSetProp (new version) ///////////////////////////////////////////////////

var ActionSetProp = function(event) {
    this.event = event;

    // serialized
    this.refToObjectProperty = new RefToObjectProperty(event);
    this.operand = new OperandVariable(event);
};

ActionSetProp.prototype.type = "ActionSetProp";
ActionSetProp.prototype.label = "Set Obj Property";

ActionSetProp.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 */
ActionSetProp.prototype.setVariableBackRef = function(){
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionSetProp.prototype.run = function(triggerParams) {
    var rValue = this.operand.getValue(triggerParams);
    this.refToObjectProperty.setValue(rValue);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetProp.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetProp.prototype.setPointers = function(entitiesArr) {
    this.refToObjectProperty.setPointers(entitiesArr);
    this.operand.setPointers(entitiesArr);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSetVariable}
 */
ActionSetProp.prototype.fromJS = function(data) {
    this.refToObjectProperty.fromJS(data.refToObjectProperty);
    this.operand.fromJS(data.operand);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSetProp.prototype.toJS = function() {
    return {
        type: this.type,
        refToObjectProperty: this.refToObjectProperty.toJS(),
        operand: this.operand.toJS()
    };
};






////////////////////////////////////////////   ActionJumpTo   /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionJumpTo = function(event) {
    this.event = event;
    this.jumpType = ko.observable(null);
    this.frameToJump= ko.observable(null);
};

ActionJumpTo.prototype.type = "ActionJumpTo";
ActionJumpTo.prototype.label = "Jump To";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionJumpTo.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionJumpTo.prototype.run = function(triggerParams) {

    // check validity only if the jump is to next frame
    if (this.jumpType() === "nextFrame"){
        var isValid = true;

        var elements = player.currentFrame.frameData.elements();
        elements.forEach(function(element) {
            if (element.content() instanceof MultipleChoiceElement || element.content() instanceof LikertElement || element.content() instanceof SelectionElement || element.content() instanceof InputElement || element.content() instanceof MultiLineInputElement  || element.content() instanceof CheckBoxElement){
                if (!element.content().isInputValid()){
                    isValid = false;
                }
            }
        });

        // now display error message at navigation element
        var elements = player.currentFrame.frameData.elements();
        elements.forEach(function(element) {
            if(element.content() instanceof NaviElement){
                element.content().showSubmitError(!isValid);
            }
        });

        if (isValid){
            player.currentFrame.endFrame();
        }
    }

    else {
        if (this.jumpType() == "previousFrame"){
            player.currentFrame.endFrameAndGoBack();
        }
        else if (this.jumpType() == "nextFrame"){
            player.currentFrame.endFrame();
        }
        else if (this.jumpType() == "nextTrial"){
            player.currentFrame.finishFrame();
            player.startNextTrial()
        }
        else if (this.jumpType() == "nextTask"){
            player.currentFrame.finishFrame();
            player.recordData();
            player.jumpToNextTask();
        }
        else if (this.jumpType() == "specificFrame"){
            player.currentFrame.goToCustomFrame(this.frameToJump());
        }
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionJumpTo.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

ActionJumpTo.prototype.reAddEntities = function(entitiesArr) {
    if (this.jumpType() == "specificFrame") {
        if (this.frameToJump()) {
            if (!entitiesArr.byId.hasOwnProperty(this.frameToJump().id())) {
                entitiesArr.push(this.frameToJump());
            }
        }
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionJumpTo.prototype.setPointers = function(entitiesArr) {
    var frame = entitiesArr.byId[this.frameToJump()];
    this.frameToJump(frame);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionJumpTo}
 */
ActionJumpTo.prototype.fromJS = function(data) {
    this.jumpType(data.jumpType);
    this.frameToJump(data.frameToJump);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionJumpTo.prototype.toJS = function() {
    var frameToJump;
    if (this.frameToJump()){
        frameToJump = this.frameToJump().id();
    }
    else {
        frameToJump = null;
    }

    return {
        type: this.type,
        jumpType: this.jumpType(),
        frameToJump: frameToJump

    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////   ActionDelayedActions   /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionDelayedActions = function(event) {
    this.event = event;
    this.timeoutFcns = [];

    // serialized:
    this.delayInMs = ko.observable(1000);
    this.subActions = ko.observableArray([]);
};

ActionDelayedActions.prototype.type = "ActionDelayedActions";
ActionDelayedActions.prototype.label = "Delayed Actions";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionDelayedActions.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionDelayedActions.prototype.run = function(triggerParams) {
    var self = this;
    var timeoutFcn = setTimeout(function() {
        var actions = self.subActions();
        for (var i=0; i<actions.length; i++) {
            actions[i].run(triggerParams);
        }
    }, this.delayInMs());
    this.timeoutFcns.push(timeoutFcn);
};


/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionDelayedActions.prototype.destroyOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.timeoutFcns, function( index, fcn ) {
        clearTimeout(fcn);
    } );
    jQuery.each( this.subActions(), function( index, action ) {
        action.destroyOnPlayerFrame(playerFrame);
    } );
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDelayedActions.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDelayedActions.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionDelayedActions}
 */
ActionDelayedActions.prototype.fromJS = function(data) {
    this.delayInMs(parseInt(data.delayInMs));

    var subActions = [];
    for (var i=0; i<data.subActions.length; i++) {
        var subAction = actionFactory(this.event, data.subActions[i].type);
        subAction.fromJS(data.subActions[i]);
        subActions.push(subAction);
    }
    this.subActions(subActions);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionDelayedActions.prototype.toJS = function() {
    var subActions = this.subActions();
    var subActionsData = [];
    for (var i=0; i<subActions.length; i++) {
        subActionsData.push(subActions[i].toJS());
    }

    return {
        type: this.type,
        delayInMs: parseInt(this.delayInMs()),
        subActions: subActionsData
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////   ActionStartRepeatedActions   /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionStartRepeatedActions = function(event) {
    this.event = event;
    this.timeoutFcns = [];

    // serialized:
    this.allowMultiple = ko.observable(false); // should it be possible to start this repeatedAction again even if it is still running?
    this.startWithoutDelay = ko.observable(false); // should the subActions be run for the first time directly without waiting for the first delay?
    this.stopConditionEnabled = ko.observable(false); // is a stop condition enabled?
    this.stopCondition = ko.observable(null); // checked before each repetition, if enabled.
    this.delayInMs = ko.observable(1000);
    this.subActions = ko.observableArray([]);
};

ActionStartRepeatedActions.prototype.type = "ActionStartRepeatedActions";
ActionStartRepeatedActions.prototype.label = "Start Repeated Actions";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionStartRepeatedActions.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionStartRepeatedActions.prototype.run = function(triggerParams) {
    var self = this;

    var start = new Date().getTime();
    var nextAt = start;
    var timeoutIdx = this.timeoutFcns.length;

    if (!this.allowMultiple()) {
        if (timeoutIdx > 0) {
            // this repeated action is already running, therefore do nothing:
            return;
        }
    }

    this.timeoutFcns.push(null);

    var scheduleNextRepetition = function() {

        // calculate time when next repetition should be scheduled:
        nextAt += self.delayInMs();
        var currTime = new Date().getTime();
        var waitingTime = nextAt - currTime;
        self.timeoutFcns[timeoutIdx] = setTimeout(runRepetition, waitingTime);

        if (waitingTime < 0) {
            console.warn("warning: ActionStartRepeatedActions cannot keep up with the desired delayInMs ("+self.delayInMs()+")")
        }

        // var drift = (currTime - start) % self.delayInMs();
        // console.log("drift: "+drift);

    };

    var runRepetition = function() {

        // check stopCondition.
        if (self.stopConditionEnabled()) {
            if (self.stopCondition().checkIfTrue(triggerParams)) {
                return;
            }
        }

        // run all subActions:
        var actions = self.subActions();
        for (var i=0; i<actions.length; i++) {
            actions[i].run(triggerParams);
        }

        // schedule next repetition:
        scheduleNextRepetition();

    };

    if (this.startWithoutDelay()) {
        runRepetition();
    }
    else {
        scheduleNextRepetition();
    }
};


/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionStartRepeatedActions.prototype.destroyOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.timeoutFcns, function( index, fcn ) {
        clearTimeout(fcn);
    } );
    jQuery.each( this.subActions(), function( index, action ) {
        action.destroyOnPlayerFrame(playerFrame);
    } );
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionStartRepeatedActions.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );

    if (this.stopCondition()) {
        this.stopCondition().setPointers(entitiesArr);
    }
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionStartRepeatedActions.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );

    if (this.stopCondition()) {
        this.stopCondition().reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionStartRepeatedActions}
 */
ActionStartRepeatedActions.prototype.fromJS = function(data) {
    this.allowMultiple(data.allowMultiple);
    this.startWithoutDelay(data.startWithoutDelay);
    this.stopConditionEnabled(data.stopConditionEnabled);

    if (data.stopCondition) {
        var stopCondition = requirementFactory(this.event, data.stopCondition.type);
        stopCondition.fromJS(data.stopCondition);
        this.stopCondition(stopCondition);
    }

    this.delayInMs(parseInt(data.delayInMs));

    var subActions = [];
    for (var i=0; i<data.subActions.length; i++) {
        var subAction = actionFactory(this.event, data.subActions[i].type);
        subAction.fromJS(data.subActions[i]);
        subActions.push(subAction);
    }
    this.subActions(subActions);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionStartRepeatedActions.prototype.toJS = function() {
    var subActions = this.subActions();
    var subActionsData = [];
    for (var i=0; i<subActions.length; i++) {
        subActionsData.push(subActions[i].toJS());
    }

    var stopCondition = null;
    if (this.stopCondition()) {
        stopCondition = this.stopCondition().toJS();
    }

    return {
        type: this.type,
        allowMultiple: this.allowMultiple(),
        startWithoutDelay: this.startWithoutDelay(),
        stopConditionEnabled: this.stopConditionEnabled(),
        stopCondition: stopCondition,
        delayInMs: parseInt(this.delayInMs()),
        subActions: subActionsData
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////   ActionConditional   /////////////////////////////////////////////////////

/**
 *
 * @param {Event} event - the parent event
 * @constructor
 */



var ActionConditional = function(event) {
    this.event = event;

    // serialized:
    this.ifElseConditions = ko.observableArray([new ActionIfCondition(this.event)]);
    this.defaultSubActions =  ko.observableArray([]);
    this.defaultConditionActive = ko.observable(false);

};

ActionConditional.prototype.type = "ActionConditional";
ActionConditional.prototype.label = "Requirement Actions";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionConditional.prototype.isValid = function(){
    return true;
};

ActionConditional.prototype.deleteIfCondition = function(index){
   this.ifElseConditions.splice(index,1);
};



ActionConditional.prototype.addIfCondition = function(){
    this.ifElseConditions.push(new ActionIfCondition(this.event));
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionConditional.prototype.run = function(triggerParams) {
    var ifElseConditions = this.ifElseConditions();
    var foundTrueCase = false;
    var caseIndex = 0;
    while (foundTrueCase ==false && caseIndex<ifElseConditions.length){
        var requirement = ifElseConditions[caseIndex].requirement();
        var actionList = ifElseConditions[caseIndex].subActions();
        if (requirement==null || requirement.checkIfTrue(triggerParams)) {
            foundTrueCase = true;
            for (var j=0; j<actionList.length; j++) {
                actionList[j].run(triggerParams);
            }
        }
        caseIndex ++;
    }
    if (foundTrueCase==false && this.defaultConditionActive()){
        var actionList = this.defaultSubActions();
        for (var j=0; j<actionList.length; j++) {
            actionList[j].run(triggerParams);
        }
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionConditional.prototype.destroyOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.defaultSubActions(), function( index, action ) {
        action.destroyOnPlayerFrame(playerFrame);
    } );
    jQuery.each( this.ifElseConditions(), function( index, ifElseCond ) {
        ifElseCond.destroyOnPlayerFrame(playerFrame);
    } );
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionConditional.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.defaultSubActions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
    jQuery.each( this.ifElseConditions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionConditional.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.defaultSubActions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
    jQuery.each( this.ifElseConditions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionConditional}
 */
ActionConditional.prototype.fromJS = function(data) {

    var defaultSubActions = [];
    for (var i=0; i<data.defaultSubActions.length; i++) {
        var subAction = actionFactory(this.event, data.defaultSubActions[i].type);
        subAction.fromJS(data.defaultSubActions[i]);
        defaultSubActions.push(subAction);
    }
    this.defaultSubActions(defaultSubActions);

    var ifElseConditions = [];
    for (var i=0; i<data.ifElseConditions.length; i++) {
        var ifCondition = new ActionIfCondition(this.event);
        ifCondition.fromJS(data.ifElseConditions[i]);
        ifElseConditions.push(ifCondition);
    }
    this.ifElseConditions(ifElseConditions);



    this.defaultConditionActive(data.defaultConditionActive);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionConditional.prototype.toJS = function() {
    var defaultSubActions = this.defaultSubActions();
    var defSubActions = [];
    for (var i=0; i<defaultSubActions.length; i++) {
        defSubActions.push(defaultSubActions[i].toJS());
    }
    var ifElseConditions = this.ifElseConditions();
    var ifConditions = [];
    for (var i=0; i<ifElseConditions.length; i++) {
        ifConditions.push(ifElseConditions[i].toJS());
    }

    return {
        type: this.type,
        defaultSubActions: defSubActions,
        ifElseConditions: ifConditions,
        defaultConditionActive: this.defaultConditionActive()
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////   ActionIfCondition  /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionIfCondition = function(event) {
    this.event = event;
    this.requirement = ko.observable(new RequirementAND(this.event));
    this.subActions = ko.observableArray([]);
};

ActionIfCondition.prototype.type = "ActionIfCondition";
ActionIfCondition.prototype.label = "If Condition";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionIfCondition.prototype.isValid = function(){
    return true;
};


/**
 * deletes all requirements.
 */
ActionIfCondition.prototype.deleteRequirement = function() {
    this.requirement(new RequirementAND(this));
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionIfCondition.prototype.run = function(triggerParams) {
    var self = this;
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionIfCondition.prototype.destroyOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.subActions(), function( index, action ) {
        action.destroyOnPlayerFrame(playerFrame);
    } );
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionIfCondition.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
    this.requirement().setPointers(entitiesArr);
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionIfCondition.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
    this.requirement().reAddEntities(entitiesArr);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionIfCondition}
 */
ActionIfCondition.prototype.fromJS = function(data) {

    var requirement = requirementFactory(this.event, data.requirement.type);
    requirement.fromJS(data.requirement);
    this.requirement(requirement);

    var subActions = [];
    for (var i=0; i<data.subActions.length; i++) {
        var subAction = actionFactory(this.event, data.subActions[i].type);
        subAction.fromJS(data.subActions[i]);
        subActions.push(subAction);
    }
    this.subActions(subActions);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionIfCondition.prototype.toJS = function() {
    var subActions = this.subActions();
    var subActionsData = [];
    for (var i=0; i<subActions.length; i++) {
        subActionsData.push(subActions[i].toJS());
    }

    var requirement = this.requirement().toJS();

    return {
        type: this.type,
        subActions: subActionsData,
        requirement: requirement
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







/////////////////////////////////////////////   ActionSetVariable    ////////////////////////////////////////////////

/**
 * This action allows to change the value of a variable.
 *
 * @param {Event} event - the parent event
 * @constructor
 */

var ActionSetVariable = function(event) {
    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.operand = ko.observable(new OperandVariable(event));
};
ActionSetVariable.prototype.type = "ActionSetVariable";
ActionSetVariable.prototype.label = "Set / Record Variable";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionSetVariable.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSetVariable.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'set variable');
};


ActionSetVariable.prototype.removeVariable = function(){
    this.variable(null);
};


/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionSetVariable.prototype.run = function(triggerParams) {
    var rValue = this.operand().getValue(triggerParams);
    this.variable().value().value(rValue);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetVariable.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetVariable.prototype.setPointers = function(entitiesArr) {
    var varToSet = entitiesArr.byId[this.variable()];
    if (varToSet){
        this.variable(varToSet);
    }
    this.operand().setPointers(entitiesArr);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSetVariable}
 */
ActionSetVariable.prototype.fromJS = function(data) {
    this.variable(data.variable);
    var operand = new OperandVariable(this.event);
    operand.fromJS(data.operand);
    this.operand(operand);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSetVariable.prototype.toJS = function() {
    var varId = null;
    if (this.variable()) {
        varId = this.variable().id();
    }
    return {
        variable: varId,
        operand: this.operand().toJS(),
        type: this.type
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////   ActionModifyVariable    ////////////////////////////////////////////////

/**
 * This action allows to change the value of a variable.
 *
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionModifyVariable = function(event) {
    this.event = event;

    this.variable = ko.observable(null);
    this.operatorType = ko.observable(null);
    this.changeType = ko.observable(null);
    this.value = ko.observable(null);
    this.operatorTypes = ko.observableArray(["=", "+", "-", "*", "/"]);
    this.changeTypes =  ko.observableArray(["value", "%","variable"]);

    var self= this;

    this.variable.subscribe(function(newVal) {
        if (self.variable() != newVal){
            self.operatorType(null);
            self.changeType(null);
            self.value(null);
        }
    });



    this.operatorType.subscribe(function(newVal) {
        if (newVal == "=") {
            self.changeTypes(["value", "%", "variable"]);
            if (self.variable() && self.variable() instanceof GlobalVar) {
                self.value(self.variable().startValue().value());
            }
        }
        else if (newVal == "*" || newVal == "/") {
            self.changeTypes(["value", "variable"]);
            self.value(1);
        }
        else if (newVal){
            self.changeTypes(["value","%", "variable"]);
            self.value(0);
        }

    });

    this.changeType.subscribe(function(newVal) {
        if (newVal == "%" && self.operatorType()=="=") {
            self.value(100);
        }
        else if (newVal == "value" && self.operatorType()=="=") {
            if (self.variable() && self.variable() instanceof GlobalVar) {
                self.value(self.variable().startValue().value());
            }
        }
    });

};
ActionModifyVariable.prototype.type = "ActionModifyVariable";
ActionModifyVariable.prototype.label = "Modify Variable";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionModifyVariable.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionModifyVariable.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'modify variable');
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionModifyVariable.prototype.run = function(triggerParams) {


    var operatorType =  this.operatorType();
    var changeType =  this.changeType();
    // make sure to calculate on numeric
    var value =  this.value();

    // make sure to calculate on numeric
    var oldValue = this.variable().value();
    if (typeof oldValue  === 'string'){
        oldValue = Number(oldValue);
    }
    if (typeof value  === 'string'){
        value = Number(value);
    }
    var newValue;

    if (operatorType== '='){
        if (changeType== 'value'){
            newValue = value;
        }
        else if (operatorType== '%'){
            newValue = oldValue * (value/100);
        }
        else if (operatorType== 'variable'){
            newValue = parseFloat(value.value());
        }
    }
    else if (operatorType== '+'){
        if (changeType== 'value'){
            newValue = oldValue + value;
        }
        else if (operatorType== '%'){
            newValue = oldValue + (oldValue * (value/100));
        }
        else if (operatorType== 'variable'){
            newValue = oldValue + parseFloat(value.value());
        }
    }
    else if (operatorType== '-'){
        if (changeType== 'value'){
            newValue = oldValue - value;
        }
        else if (operatorType== '%'){
            newValue = oldValue - (oldValue * (value/100));
        }
        else if (operatorType== 'variable'){
            newValue = oldValue - parseFloat(value.value());
        }
    }
    else if (operatorType== '*'){
        if (changeType== 'value'){
            newValue = oldValue * value;
        }
        else if (operatorType== '%'){
            newValue = oldValue * (oldValue * (value/100));
        }
        else if (operatorType== 'variable'){
            newValue = oldValue * parseFloat(value.value());
        }
    }
    else if (operatorType== '/'){
        if (changeType== 'value'){
            newValue = oldValue / value;
        }
        else if (operatorType== '%'){
            newValue = oldValue / (oldValue * (value/100));
        }
        else if (operatorType== 'variable'){
            newValue = oldValue / parseFloat(value.value());
        }
    }
    this.variable().value(newValue);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionModifyVariable.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionModifyVariable.prototype.setPointers = function(entitiesArr) {

    var mainVariable = entitiesArr.byId[this.variable()];
    this.variable(mainVariable);

    if (entitiesArr.byId[this.value()]){
        var valueVariable = entitiesArr.byId[this.value()];
        this.value(valueVariable);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionModifyVariable}
 */
ActionModifyVariable.prototype.fromJS = function(data) {

    this.variable(data.variable);
    this.operatorType(data.operatorType);
    this.changeType(data.changeType);
    this.value(data.value);
    this.operatorTypes(data.operatorTypes);
    this.changeTypes(data.changeTypes);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionModifyVariable.prototype.toJS = function() {
    var value = null;
    if (this.value() && this.value().hasOwnProperty("id")){
        value = this.value.id();
    }
    else {
        value = this.value();
    }
    return {
        variable: this.variable().id(),
        operatorType: this.operatorType(),
        changeType: this.changeType(),
        value: value,
        operatorTypes: this.operatorTypes(),
        changeTypes: this.changeTypes(),
        type: this.type

    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////   ActionDrawRandomNumber    ////////////////////////////////////////////////

/**
 * This action sets the value of a variable to a random number drawn from a specified distribution.
 *
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionDrawRandomNumber = function(event) {
    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.distribution = ko.observable('Uniform');
    this.distributionParam1 = ko.observable(0).extend({ numeric: 4 }); // i.e. lower bound of Uniform or mean of Gaussian
    this.distributionParam2 = ko.observable(1).extend({ numeric: 4 }); // i.e. upper bound of Uniform or std of Gaussian
};
ActionDrawRandomNumber.prototype.type = "ActionDrawRandomNumber";
ActionDrawRandomNumber.prototype.label = "Draw Random Number";
ActionDrawRandomNumber.prototype.distributions = ["Uniform", "Gaussian"];
ActionDrawRandomNumber.prototype.distributionParamLabels = {
    "Uniform": ["min", "max"],
    "Gaussian": ["mean", "std"]
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionDrawRandomNumber.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionDrawRandomNumber.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'Action Draw Random Number');
};

/**
 * draws a Gaussian distributed random number (randn) using Box-Muller transform.
 *
 * @returns {number}
 */
function randn_bm() {
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

/**
 * creates a Gaussian random number generator (randn) with marsaglia_polar algorithm.
 *
 * randn_marsaglia_polar is a function that generates and returns new randn numbers.
 */
var randn_marsaglia_polar = (function() {
    var y2;
    var isSpareReady = false;

    /**
     * draws a gaussian distributed random number (randn) with marsaglia_polar algorithm
     *
     * @returns {number}
     */
    function randn_mp() {
        var y1;
        if(isSpareReady) {
            y1 = y2;
            isSpareReady = false;
        }
        else {
            var x1, x2, w;
            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w  = x1 * x1 + x2 * x2;
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            isSpareReady = true;
        }
        return y1;
    }

    return randn_mp;
})();

/**
 * This function is called when the parent event was triggered and the requirements are true. It draws a random number
 * and saves it into the globalVar.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionDrawRandomNumber.prototype.run = function(triggerParams) {
    var value;
    if (this.distribution() == "Uniform") {
        var min = this.distributionParam1();
        var max = this.distributionParam2();
        value = Math.random() * (max - min) + min;
        this.variable().value().value(value);
    }
    else if (this.distribution() == "Gaussian") {
        var mean = this.distributionParam1();
        var std = this.distributionParam2();
        value = mean + randn_marsaglia_polar() * std;
        this.variable().value().value(value);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionDrawRandomNumber.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDrawRandomNumber.prototype.setPointers = function(entitiesArr) {
    if (this.variable()){
        var globVar = entitiesArr.byId[this.variable()];
        this.variable(globVar);
        this.setVariableBackRef(globVar);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionDrawRandomNumber}
 */
ActionDrawRandomNumber.prototype.fromJS = function(data) {
    this.variable(data.variable);
    this.distribution(data.distribution);
    this.distributionParam1(data.distributionParam1);
    this.distributionParam2(data.distributionParam2);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionDrawRandomNumber.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        variable: variableId,
        distribution: this.distribution(),
        distributionParam1: this.distributionParam1(),
        distributionParam2: this.distributionParam2()
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////  ActionControlAV/  //////////////////////////////////////////////

/**
 * This action allows to start or stop the playback of audio or video elements.
 *
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionControlAV = function(event) {
    this.event = event;

    // serialized
    this.target = ko.observable(null);
    this.actionType = ko.observable(null);

};


ActionControlAV.prototype.type = "ActionControlAV";
ActionControlAV.prototype.label = "Control Audio or Video";
ActionControlAV.prototype.actionTypes = ["start","pause","end"];



/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionControlAV.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It starts or stops
 * playback of audio or video files in the player.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionControlAV.prototype.run = function(triggerParams) {

    if (this.target()) {
        var elem = $(player.currentFrame.frameView.viewElements.byId[this.target().id()].div).find("audio, video");

        if (elem.length > 0) {
            if (this.actionType() == 'start') {
                elem[0].play();
            }
            else if (this.actionType() == 'end') {
                elem[0].pause();
                elem[0].currentTime = 0;
            }
            else if (this.actionType() == 'pause') {
                elem[0].pause();
            }
        }
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionControlAV.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlAV.prototype.setPointers = function(entitiesArr) {
    this.target(entitiesArr.byId[this.target()]);
};


/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionControlAV}
 */
ActionControlAV.prototype.fromJS = function(data) {
    this.target(data.target);
    this.actionType(data.actionType);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionControlAV.prototype.toJS = function() {
    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }
    return {
        type: this.type,
        target: targetId,
        actionType: this.actionType()
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////





/////////////////////////////////////////////////  ActionControlTimer ///////////////////////////////////////////////

/**
 * This action allows to start or stop the playback of audio or video elements.
 *
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionControlTimer = function(event) {
    this.event = event;

    // serialized
    this.timerVar = ko.observable(null);
    this.actionType = ko.observable(null);
    this.updateRate =  ko.observable(50);// in milli seconds
    this.updateValue = ko.observable(null);

    // not serialized
    this.referencesToTriggers = [];

};


ActionControlTimer.prototype.type = "ActionControlTimer";
ActionControlTimer.prototype.label = "Control Timer";
ActionControlTimer.prototype.actionTypes = ["countUp","countDown","set","pause"];



/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionControlTimer.prototype.isValid = function(){
    return true;
};

ActionControlTimer.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'control timer');
};


ActionControlTimer.prototype.removeVariable = function(){
    this.timerVar(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It starts or stops
 * playback of audio or video files in the player.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionControlTimer.prototype.run = function(triggerParams) {
    if (this.timerVar()) {
        if (this.actionType() == 'countUp') {
            this.timerVar().value().startCountup();
        }
        else if (this.actionType() == 'countDown') {
            this.timerVar().value().startCountdown();
        }
        else if (this.actionType() == 'set') {
            var updateValue = parseInt(this.updateValue());
            this.timerVar().value().setValue(updateValue);
        }
        else if (this.actionType() == 'pause') {
            this.timerVar().value().pause();
        }
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionControlTimer.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlTimer.prototype.setPointers = function(entitiesArr) {
    var timerVar = entitiesArr.byId[this.timerVar()];
    if (timerVar){
        this.timerVar(timerVar);
    }
};


/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionControlAV}
 */
ActionControlTimer.prototype.fromJS = function(data) {
    this.timerVar(data.timerVar);
    this.actionType(data.actionType);
    this.updateValue(data.updateValue);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionControlTimer.prototype.toJS = function() {
    var timerVar = null;
    if (this.timerVar()) {
        timerVar = this.timerVar().id();
    }
    return {
        type: this.type,
        timerVar: timerVar,
        actionType: this.actionType(),
        updateValue: this.updateValue()
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////  ActionRecordQuestionaireResponse  //////////////////////////////////////////

/**
 * This action records the response from a questionaire element.
 *
 * @param {Event} event - the parent event
 * @constructor
 */
var ActionRecordQuestionaireResponse = function(event) {
    this.event = event;

    // serialized
    this.variableId = ko.observable(undefined);
    this.variable = null;

};
ActionRecordQuestionaireResponse.prototype.type = "ActionRecordQuestionaireResponse";
ActionRecordQuestionaireResponse.prototype.label = "Record Questionaire Answer";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionRecordQuestionaireResponse.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It records the answers
 * of a questionaire and directly sends them to the server.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionRecordQuestionaireResponse.prototype.run = function(triggerParams) {
    var blockId = player.getBlockId();
    var trialId = player.getTrialId();
    var resp = triggerParams.questionElement.content.answer;
    var recData = new RecData();
    recData.addRecording(this.variable);
    player.addRecording(blockId,trialId,recData.toJS());
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionRecordQuestionaireResponse.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecordQuestionaireResponse.prototype.setPointers = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionRecordQuestionaireResponse}
 */
ActionRecordQuestionaireResponse.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionRecordQuestionaireResponse.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId()
    };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Factory method that creates a new action based on the given action type.
 *
 * @param {Event} event - the parent event of the new action.
 * @param {string} type - the type of the Action (i.e. "ActionRecordQuestionaireResponse")
 * @returns {Action}
 */
function actionFactory(event,type) {
    var action = new window[type](event);
    return action;
}