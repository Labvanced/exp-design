// � by Caspar Goeke and Holger Finger


////////////////////////

/**
 * This Trigger handles mouse interactions with stimulus elements.
 *
 * @param {Event} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerMouse = function(event) {
    this.event = event;
    this.mouseX = null;
    this.mouseY = null;

    // serialized
    this.buttonType = ko.observable("Left");
    this.interactionType = ko.observable("Click");
    this.targets = ko.observableArray([]);
};

TriggerMouse.prototype.type = "TriggerMouse";
TriggerMouse.prototype.label = "Mouse Trigger";
TriggerMouse.prototype.buttonTypes = ["Left", "Right"];
TriggerMouse.prototype.interactionTypes = ["Click", "PressDown", "PressUp", "Hover"];

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerMouse.prototype.isValid = function() {
    if (this.event.trigger() && this.targets().length>0){
        return true;
    }
    else{
        return false;
    }
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerMouse.prototype.getParameterSpec = function() {
    return [
        'Stimulus Name',
        'Time From Frame Onset',
        'Stimulus Info'
    ];
};

/**
 * private member function to trigger the event on a specific target object
 * @param playerFrame
 * @param target
 */
TriggerMouse.prototype.triggerOnTarget = function(playerFrame,target) {
    var stimulusInformation = null;
    if (target.content().hasOwnProperty("stimulusInformation")){
        stimulusInformation =  target.content().modifier().selectedTrialView.stimulusInformation();
    }
    this.event.triggerActions([
        target.name(),
        playerFrame.getFrameTime(),
        stimulusInformation
    ]);
};

/**
 * this function is called in the player when the frame starts. It sets up the corresponding click handlers.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerMouse.prototype.setupOnPlayerFrame = function(playerFrame) {

    var self = this;

    switch (this.interactionType()){
        case "Click":

            for (var i = 0; i<this.targets().length;i++){
                var target = this.targets()[i];
                var self = this;
                if (this.buttonType() == "Left"){
                    (function(target) {
                        if (!(target.content() instanceof NaviElement)){
                            $(playerFrame.frameView.viewElements.byId[target.id()].div).click(function(ev) {
                                self.mouseX = playerFrame.mouseX;
                                self.mouseY = playerFrame.mouseY;
                                self.triggerOnTarget(playerFrame,target);
                            });
                        }
                        else {
                            if (self.event.actions()[0] instanceof ActionJumpTo){
                                if(self.event.actions()[0].jumpType()=="previousFrame"){
                                    $($(playerFrame.frameView.viewElements.byId[target.id()].div).find('.eventBackward')).click(function(ev) {
                                        ev.stopImmediatePropagation();
                                        self.mouseX = playerFrame.mouseX;
                                        self.mouseY = playerFrame.mouseY;
                                        self.triggerOnTarget(playerFrame,target);
                                    });
                                }

                                else if(self.event.actions()[0].jumpType()=="nextFrame"){
                                    $($(playerFrame.frameView.viewElements.byId[target.id()].div).find('.eventForward')).click(function(ev) {
                                        ev.stopImmediatePropagation();
                                        self.mouseX = playerFrame.mouseX;
                                        self.mouseY = playerFrame.mouseY;
                                        self.triggerOnTarget(playerFrame,target);

                                    });
                                }
                            }
                        }

                    })(target);
                }

                else if (this.buttonType() == "Right"){
                    (function(target) {
                        if (!(target.content() instanceof NaviElement)){
                            $(playerFrame.frameView.viewElements.byId[target.id()].div).contextmenu(function(ev) {
                                self.mouseX = playerFrame.mouseX;
                                self.mouseY = playerFrame.mouseY;
                                self.triggerOnTarget(playerFrame,target);
                            });
                        }
                        else {
                            if (self.event.actions()[0] instanceof ActionJumpTo){
                                if(self.event.actions()[0].jumpType()=="previousFrame"){
                                    $($(playerFrame.frameView.viewElements.byId[target.id()].div).find('.eventBackward')).contextmenu(function(ev) {
                                        ev.stopImmediatePropagation();
                                        self.mouseX = playerFrame.mouseX;
                                        self.mouseY = playerFrame.mouseY;
                                        self.triggerOnTarget(playerFrame,target);
                                    });
                                }

                                else if(self.event.actions()[0].jumpType()=="nextFrame"){
                                    $($(playerFrame.frameView.viewElements.byId[target.id()].div).find('.eventForward')).contextmenu(function(ev) {
                                        ev.stopImmediatePropagation();
                                        self.mouseX = playerFrame.mouseX;
                                        self.mouseY = playerFrame.mouseY;
                                        self.triggerOnTarget(playerFrame,target);

                                    });
                                }
                            }
                        }

                    })(target);
                }
            }
            break;


        case "PressDown":
            for (var i = 0; i<this.targets().length;i++){
                var target = this.targets()[i];
                // closure to make event persistent over loop:
                (function(target) {
                    if (!(target.content() instanceof NaviElement)){
                        $(playerFrame.frameView.viewElements.byId[target.id()].div).on('mousedown',function(ev) {
                            if ((self.buttonType() == "Left" && ev.button==0) || (self.buttonType() == "Right" && ev.button==2)){
                                self.mouseX = playerFrame.mouseX;
                                self.mouseY = playerFrame.mouseY;
                                self.triggerOnTarget(playerFrame,target);
                            }
                        });
                    }
                    else {
                        if (self.event.actions()[0] instanceof ActionJumpTo){
                            if(self.event.actions()[0].jumpType()=="previousFrame"){
                                $($(playerFrame.frameView.viewElements.byId[target.id()].div).find('.eventBackward')).on('mousedown',function(ev) {
                                    if ((self.buttonType() == "Left" && ev.button==0) || (self.buttonType() == "Right" && ev.button==2)){
                                        ev.stopImmediatePropagation();
                                        self.mouseX = playerFrame.mouseX;
                                        self.mouseY = playerFrame.mouseY;
                                        self.triggerOnTarget(playerFrame,target);
                                    }

                                });
                            }

                            else if(self.event.actions()[0].jumpType()=="nextFrame"){
                                $($(playerFrame.frameView.viewElements.byId[target.id()].div).find('.eventForward')).on('mousedown',function(ev) {
                                    if ((self.buttonType() == "Left" && ev.button==0) || (self.buttonType() == "Right" && ev.button==2)){
                                        ev.stopImmediatePropagation();
                                        self.mouseX = playerFrame.mouseX;
                                        self.mouseY = playerFrame.mouseY;
                                        self.triggerOnTarget(playerFrame,target);
                                    }
                                });
                            }
                        }
                    }

                })(target);
            }
            break;

        case "PressUp":
            for (var i = 0; i<this.targets().length;i++){
                var target = this.targets()[i];
                // closure to make event persistent over loop:
                (function(target) {
                    if (!(target.content() instanceof NaviElement)){
                        $(playerFrame.frameView.viewElements.byId[target.id()].div).mouseup(function(ev) {
                            if ((self.buttonType() == "Left" && ev.button==0) || (self.buttonType() == "Right" && ev.button==2)){
                                self.mouseX = playerFrame.mouseX;
                                self.mouseY = playerFrame.mouseY;
                                self.triggerOnTarget(playerFrame,target);
                            }
                        });
                    }
                    else {
                        if (self.event.actions()[0] instanceof ActionJumpTo){
                            if(self.event.actions()[0].jumpType()=="previousFrame"){
                                $($(playerFrame.frameView.viewElements.byId[target.id()].div).find('.eventBackward')).mouseup(function(ev) {
                                    if ((self.buttonType() == "Left" && ev.button==0) || (self.buttonType() == "Right" && ev.button==2)){
                                        ev.stopImmediatePropagation();
                                        self.mouseX = playerFrame.mouseX;
                                        self.mouseY = playerFrame.mouseY;
                                        self.triggerOnTarget(playerFrame,target);
                                    }

                                });
                            }

                            else if(self.event.actions()[0].jumpType()=="nextFrame"){
                                $($(playerFrame.frameView.viewElements.byId[target.id()].div).find('.eventForward')).mouseup(function(ev) {
                                    if ((self.buttonType() == "Left" && ev.button==0) || (self.buttonType() == "Right" && ev.button==2)){
                                        ev.stopImmediatePropagation();
                                        self.mouseX = playerFrame.mouseX;
                                        self.mouseY = playerFrame.mouseY;
                                        self.triggerOnTarget(playerFrame,target);
                                    }
                                });
                            }
                        }
                    }
                })(target);
            }
            break;

        case "Hover":
            for (var i = 0; i < this.targets().length; i++) {
                var target = this.targets()[i];
                // closure to make event persistent over loop:
                (function ( target) {

                    if (!(target.content() instanceof NaviElement)){
                        $(playerFrame.frameView.viewElements.byId[target.id()].div).mouseover(function (ev) {
                            self.mouseX = playerFrame.mouseX;
                            self.mouseY = playerFrame.mouseY;
                            self.triggerOnTarget(playerFrame,target);
                        });
                    }
                    else {
                        if (self.event.actions()[0] instanceof ActionJumpTo){
                            if(self.event.actions()[0].jumpType()=="previousFrame"){
                                $($(playerFrame.frameView.viewElements.byId[target.id()].div).find('.eventBackward')).mouseover(function(ev) {
                                    ev.stopImmediatePropagation();
                                    self.mouseX = playerFrame.mouseX;
                                    self.mouseY = playerFrame.mouseY;
                                    self.triggerOnTarget(playerFrame,target);
                                });
                            }

                            else if(self.event.actions()[0].jumpType()=="nextFrame"){
                                $($(playerFrame.frameView.viewElements.byId[target.id()].div).find('.eventForward')).mouseover(function(ev) {
                                    ev.stopImmediatePropagation();
                                    self.mouseX = playerFrame.mouseX;
                                    self.mouseY = playerFrame.mouseY;
                                    self.triggerOnTarget(playerFrame,target);

                                });
                            }
                        }
                    }



                })(target);
            }
            break;
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerMouse.prototype.destroyOnPlayerFrame = function(playerFrame) {

};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerMouse.prototype.setPointers = function(entitiesArr) {
    this.targets(jQuery.map( this.targets(), function( id ) {
        return entitiesArr.byId[id];
    } ));
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerMouse}
 */
TriggerMouse.prototype.fromJS = function(data) {
    this.buttonType(data.buttonType);
    this.interactionType(data.interactionType);
    this.targets(data.targets);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerMouse.prototype.toJS = function() {
    return {
        type: this.type,
        buttonType: this.buttonType(),
        interactionType: this.interactionType(),
        targets: jQuery.map( this.targets(), function( element ) { return element.id(); } )
    };
};

////////////////////////


/**
 * This Trigger handles keyboard interactions of the participant with the experiment.
 *
 * @param {Event} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerKeyboard = function(event) {
    this.event = event;

    // serialized
    this.buttons = ko.observableArray([]);
    this.interactionType = ko.observable("Pressed");
};

TriggerKeyboard.prototype.type = "TriggerKeyboard";
TriggerKeyboard.prototype.label = "Keyboard Trigger";
TriggerKeyboard.prototype.interactionTypes = ["PressDown", "PressUp"];

TriggerKeyboard.prototype.buttonTypesArrows = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];
TriggerKeyboard.prototype.buttonTypesNumbers = ["0","1", "2", "3", "4", "5", "6", "7", "8", "9"];
TriggerKeyboard.prototype.buttonTypesLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
TriggerKeyboard.prototype.buttonTypesSpecial= ["Space","Enter","Ctrl","Tab","Shift"];
TriggerKeyboard.prototype.buttonTypesFkeys= ["F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12"];

TriggerKeyboard.prototype.buttonTypesArrowsCode = [37,38,39,40];
TriggerKeyboard.prototype.buttonTypesNumbersCode = [48,49,50,51,52,53,54,55,56,57];
TriggerKeyboard.prototype.buttonTypesLettersCode = [65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90];
TriggerKeyboard.prototype.buttonTypesSpecialCode= [32,13,17,9,16];
TriggerKeyboard.prototype.buttonTypesFkeysCode= [112,113,114,115,116,117,118,119,120,121,122,123];

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerKeyboard.prototype.isValid = function() {
    if (this.event.trigger() && this.buttons().length>0){
        return true;
    }
    else{
        return false;
    }
};

/**
 * returns the validKeyCodes to which the player should listen.
 *
 * @returns {string[]}
 */
TriggerKeyboard.prototype.getValidKeyCodes = function() {
    var allKeys = this.buttonTypesFkeys.concat(this.buttonTypesSpecial.concat(this.buttonTypesLetters.concat(this.buttonTypesArrows.concat(this.buttonTypesNumbers))));
    var allKeysCode = this.buttonTypesFkeysCode.concat(this.buttonTypesSpecialCode.concat(this.buttonTypesLettersCode.concat(this.buttonTypesArrowsCode.concat(this.buttonTypesNumbersCode))));

    validKeyCodes = [];
    var validKeys = this.buttons();
    for (var i = 0; i<this.buttons().length; i++) {
        var index =  allKeys.indexOf(validKeys[i]);
        validKeyCodes.push(allKeysCode[index]);
    }

    return validKeyCodes;
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerKeyboard.prototype.getParameterSpec = function() {
    return [
        'Id of Key',
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the corresponding keyboard handlers.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerKeyboard.prototype.setupOnPlayerFrame = function(playerFrame) {
    var self = this;
    var validKeyCodes = this.getValidKeyCodes();

    if (this.interactionType() == "PressDown"){
        (function() {
            $(document).on("keydown", function (ev){
                var keyIdx = validKeyCodes.indexOf(ev.keyCode);
                if (keyIdx>=0){
                    if (self.buttonTypesFkeysCode.indexOf(ev.keyCode) >= 0) {
                        // only prevent default for F keys:
                        ev.preventDefault();
                    }
                    self.mouseX = playerFrame.mouseX;
                    self.mouseY = playerFrame.mouseY;
                    self.event.triggerActions([self.buttons()[keyIdx],playerFrame.getFrameTime()]);
                }

            });
        })();
    }

    else if (this.interactionType() == "PressUp"){
        (function() {
            $(document).on("keyup", function (ev){
                var keyIdx = validKeyCodes.indexOf(ev.keyCode);
                if (keyIdx>=0){
                    if (self.buttonTypesFkeysCode.indexOf(ev.keyCode) >= 0) {
                        // only prevent default for F keys:
                        ev.preventDefault();
                    }
                    self.mouseX = playerFrame.mouseX;
                    self.mouseY = playerFrame.mouseY;
                    self.event.triggerActions([self.buttons()[keyIdx],playerFrame.getFrameTime()]);
                }
            });
        })();
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerKeyboard.prototype.destroyOnPlayerFrame = function(playerFrame) {

};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerKeyboard.prototype.setPointers = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerKeyboard}
 */
TriggerKeyboard.prototype.fromJS = function(data) {
    this.buttons(data.buttons);
    this.interactionType(data.interactionType);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerKeyboard.prototype.toJS = function() {
    return {
        type: this.type,
        buttons: this.buttons().slice(0),
        interactionType: this.interactionType()
    };
};

////////////////////////


/**
 * This Trigger is executed when the frame starts.
 *
 * @param {Event} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerOnFrameStart = function(event) {
    this.event = event;

    // serialized

};

TriggerOnFrameStart.prototype.type = "TriggerOnFrameStart";
TriggerOnFrameStart.prototype.label = "On Frame Start Trigger";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerOnFrameStart.prototype.isValid = function() {
    return true;
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerOnFrameStart.prototype.getParameterSpec = function() {
    return [
    ];
};

/**
 * this function is called in the player when the frame starts. It directly triggers the actions.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerOnFrameStart.prototype.setupOnPlayerFrame = function(playerFrame) {
    var self = this;
    playerFrame.onFrameStartCallbacks.push(function(){
        self.event.triggerActions([]);
    });
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerOnFrameStart.prototype.destroyOnPlayerFrame = function(playerFrame) {

};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerOnFrameStart.prototype.setPointers = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerOnFrameStart}
 */
TriggerOnFrameStart.prototype.fromJS = function(data) {
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerOnFrameStart.prototype.toJS = function() {
    return {
        type: this.type,
    };
};


////////////////////////


/**
 * This Trigger is executed when the frame ends.
 *
 * @param {Event} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerOnFrameEnd = function(event) {
    this.event = event;

    // serialized
};

TriggerOnFrameEnd.prototype.type = "TriggerOnFrameEnd";
TriggerOnFrameEnd.prototype.label = "On Frame End Trigger";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerOnFrameEnd.prototype.isValid = function() {
    return true;
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerOnFrameEnd.prototype.getParameterSpec = function() {
    return [
        "totalFrameTime"
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the frame end callback.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerOnFrameEnd.prototype.setupOnPlayerFrame = function(playerFrame) {
    var self = this;
    playerFrame.onFrameEndCallbacks.push(function(){
        self.event.triggerActions([playerFrame.getFrameTime()]);
    });
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerOnFrameEnd.prototype.destroyOnPlayerFrame = function(playerFrame) {

};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerOnFrameEnd.prototype.setPointers = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerOnFrameEnd}
 */
TriggerOnFrameEnd.prototype.fromJS = function(data) {
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerOnFrameEnd.prototype.toJS = function() {
    return {
        type: this.type
    };
};


////////////////////////

/**
 * This Trigger is executed when a timer reaches a specific value.
 *
 * @param {Event} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerTimerReached = function(event) {
    this.event = event;

    // serialized
    this.timerVar = ko.observable(null);
    this.timeInMs = ko.observable(0);
    this.repeat = ko.observable(false);
};

TriggerTimerReached.prototype.type = "TriggerTimerReached";
TriggerTimerReached.prototype.label = "Timer Reached Trigger";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerTimerReached.prototype.isValid = function() {
    return true;
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerTimerReached.prototype.getParameterSpec = function() {
    return [
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the corresponding timer callbacks.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerTimerReached.prototype.setupOnPlayerFrame = function(playerFrame) {
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerTimerReached.prototype.destroyOnPlayerFrame = function(playerFrame) {

};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerTimerReached.prototype.setPointers = function(entitiesArr) {
    if (this.timerVar()){
        this.timerVar(entitiesArr.byId[this.timerVar()]);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerTimerReached}
 */
TriggerTimerReached.prototype.fromJS = function(data) {
    this.timerVar(data.timerVar);
    this.timeInMs(data.timeInMs);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerTimerReached.prototype.toJS = function() {
    var timerVarId = null;
    if (this.timerVar()) {
        timerVarId = this.timerVar().id();
    }

    return {
        type: this.type,
        timerVar: timerVarId,
        timeInMs: this.timeInMs()
    };
};


////////////////////////


/**
 * This Trigger is executed when the value of a specific variable is changed.
 *
 * @param {Event} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerVariableValueChanged = function(event) {
    this.event = event;

    // serialized
    this.variables = ko.observableArray([]);

    // not serialized:
    this.subscriberHandles = [];
};

TriggerVariableValueChanged.prototype.type = "TriggerVariableValueChanged";
TriggerVariableValueChanged.prototype.label = "Variable Value Changed Trigger";

TriggerVariableValueChanged.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, false, true, 'Trigger On Variable Change');
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerVariableValueChanged.prototype.isValid = function() {
    return true;
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerVariableValueChanged.prototype.getParameterSpec = function() {
    return [
        "newValue"
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerVariableValueChanged.prototype.setupOnPlayerFrame = function(playerFrame) {
    var self = this;
    var variables = this.variables();
    for (var i=0; i<variables.length; i++) {
        var subscribeHandle = variables[i].value().value.subscribe(function(newVal){
            self.event.triggerActions([newVal]);
        });
        this.subscriberHandles.push(subscribeHandle);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerVariableValueChanged.prototype.destroyOnPlayerFrame = function(playerFrame) {
    for (var i=0; i<this.subscriberHandles.length; i++) {
        this.subscriberHandles[i].dispose();
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerVariableValueChanged.prototype.setPointers = function(entitiesArr) {
    var variableIds = this.variables();
    var variables = [];
    for (var i=0; i<variableIds.length; i++) {
        var globVar = entitiesArr.byId[variableIds[i]];
        variables.push(globVar);
        this.setVariableBackRef(globVar);
    }
    this.variables(variables);
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerVariableValueChanged.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.variables(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerVariableValueChanged}
 */
TriggerVariableValueChanged.prototype.fromJS = function(data) {
    this.variables(data.variables);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerVariableValueChanged.prototype.toJS = function() {
    var variableIds = [];
    var variables = this.variables();
    for (var i=0; i<variables.length; i++) {
        variableIds.push(variables[i].id());
    }

    return {
        type: this.type,
        variables: variableIds
    };
};

///////////////////////////



////////////////////////



var TriggerAudioVideoEvent= function(event) {
    this.event = event;

    // serialized
    this.target = ko.observable(null);
    this.triggerType = ko.observable(null);


};

TriggerAudioVideoEvent.prototype.type = "TriggerAudioVideoEvent";
TriggerAudioVideoEvent.prototype.label = "Audio / Video Event Trigger";
TriggerAudioVideoEvent.prototype.triggerTypes = ["started","paused", "ended"];


TriggerAudioVideoEvent.prototype.getParameterSpec = function() {
    return [
        "timeOfAudioVideo"
    ];
};

TriggerAudioVideoEvent.prototype.isValid = function() {
    return true;
};

TriggerAudioVideoEvent.prototype.setupOnPlayerFrame = function(playerFrame) {

    var self = this;
    var elem =  $(player.currentFrame.frameView.viewElements.byId[this.target().id()].div).find("audio, video");
    if (elem.length > 0) {
        switch (this.triggerType()) {
            case "started":
                elem.bind("play", function () {
                    self.event.triggerActions([0]);
                });
                break;
            case "paused":
                elem.bind("pause", function () {
                    var currTime = elem[0].currentTime;
                    self.event.triggerActions([currTime]);
                });
                break;
            case "ended":
                elem.bind("ended", function () {
                    var duration = elem[0].duration;
                    self.event.triggerActions([duration]);
                });
                break;
        }
    }

};


TriggerAudioVideoEvent.prototype.destroyOnPlayerFrame = function(playerFrame) {

};


TriggerAudioVideoEvent.prototype.setPointers = function(entitiesArr) {
    this.target(entitiesArr.byId[this.target()]);
};



TriggerAudioVideoEvent.prototype.fromJS = function(data) {
    this.target(data.target);
    this.triggerType(data.triggerType);
    return this;
};

TriggerAudioVideoEvent.prototype.toJS = function() {

    return {
        type: this.type,
        target: this.target().id(),
        triggerType: this.triggerType()
    };
};

///////////////////////////

/**
 * Factory method that creates a new trigger based on the given trigger type.
 *
 * @param {Event} event - the parent event of the new action.
 * @param {string} type - the type of the Trigger (i.e. "TriggerVariableValueChanged")
 * @returns {Trigger}
 */
function triggerFactory(event,type) {
    var trigger = new window[type](event);
    return trigger;
}