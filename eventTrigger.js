// � by Caspar Goeke and Holger Finger
"use strict";

////////////////////////

/**
 * This Trigger handles mouse interactions with stimulus elements.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerMouse = function (event) {
    this.event = event;

    // serialized
    this.buttonType = ko.observable("Left");
    this.interactionType = ko.observable("Click");
    this.targets = ko.observableArray([]);

    // not serialized:
    this.eventHandlesForCleanUp = [];

};

TriggerMouse.prototype.type = "TriggerMouse";
TriggerMouse.prototype.label = "Mouse Trigger";
TriggerMouse.prototype.buttonTypes = ["Left", "Right"];
TriggerMouse.prototype.interactionTypes = ["Click", "PressDown", "PressUp", "Hover", "Leave", "Move"];

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerMouse.prototype.isValid = function () {
    if (this.event.trigger() && this.targets().length > 0) {
        return true;
    }
    else {
        return false;
    }
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerMouse.prototype.getParameterSpec = function () {
    return [
        'Stimulus Name',
        'Time From Frame Onset',
        'Stimulus Info',
        'MouseX',
        'MouseY',
        'Mouse [X,Y] Array',
    ];
};

/**
 * private member function to trigger the event on a specific target object
 * @param playerFrame
 * @param target
 */
TriggerMouse.prototype.triggerOnTarget = function (playerFrame, target, ev) {
    var isActive = true;
    if (target.modifier().selectedTrialView.isActive) {
        isActive = target.modifier().selectedTrialView.isActive();
    }
    if (isActive) {
        var stimulusInformation = null;
        if (target.content && target.content().hasOwnProperty("stimulusInformation")) {
            stimulusInformation = target.content().modifier().selectedTrialView.stimulusInformation();
        }

        var mouseX = ev.clientX;
        var mouseY = ev.clientY;

        // convert to frame coordinates if this is not a page:
        //var playerFrame = player.currentFrame;
        if (playerFrame.frameData instanceof FrameData) {
            var scale = playerFrame.frameView.scale();
            var offX = (window.innerWidth - playerFrame.frameData.frameWidth() * scale) / 2;
            var offY = (window.innerHeight - playerFrame.frameData.frameHeight() * scale) / 2;
            mouseX = (mouseX - offX) / scale;
            mouseY = (mouseY - offY) / scale;
        }

        this.event.triggerActions([
            target.name(),
            playerFrame.getFrameTime(),
            stimulusInformation,
            mouseX,
            mouseY,
            [mouseX, mouseY]
        ]);
    }
};

/**
 * this function is called in the player when the frame starts. It sets up the corresponding click handlers.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerMouse.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;

    function createEventListener(target) {

        var targetElemView = playerFrame.frameView.viewElements.byId[target.id()];
        if (targetElemView) {
            var targetElem = $(targetElemView.div);
        }
        else if (playerFrame.frameData.id() == target.id()) {
            console.log("add trigger on whole frame.");
            var targetElem = $(playerFrame.frameDiv);
        }
        else {
            return;
        }

        var eventHandle = {
            elem: targetElem,
            eventName: null,
            cb: null
        };



        switch (self.interactionType()) {

            case "Click":
                if (self.buttonType() === "Left") {
                    eventHandle.eventName = 'click';
                    eventHandle.cb = function (ev) {
                        self.triggerOnTarget(playerFrame, target, ev);
                    };
                }
                else if (self.buttonType() === "Right") {
                    eventHandle.eventName = 'contextmenu';
                    eventHandle.cb = function (ev) {
                        self.triggerOnTarget(playerFrame, target, ev);
                    };
                }
                break;

            case "PressDown":
                eventHandle.eventName = 'mousedown touchstart';
                eventHandle.cb = function (ev) {
                    if ((self.buttonType() === "Left" && ev.button == 0) || (self.buttonType() === "Right" && ev.button == 2) || ev.type === 'touchstart') {
                        self.triggerOnTarget(playerFrame, target, ev);
                    }
                };
                break;

            case "PressUp":
                eventHandle.eventName = 'mouseup touchend';
                eventHandle.cb = function (ev) {
                    if ((self.buttonType() === "Left" && ev.button == 0) || (self.buttonType() === "Right" && ev.button == 2) || ev.type === 'touchend') {
                        self.triggerOnTarget(playerFrame, target, ev);
                    }
                };
                break;

            case "Move":
                eventHandle.eventName = 'mousemove touchmove';
                eventHandle.cb = function (ev) {
                    if ((self.buttonType() === "Left" && ev.button == 0) || (self.buttonType() === "Right" && ev.button == 2) || ev.type === 'touchmove') {
                        self.triggerOnTarget(playerFrame, target, ev);
                    }
                };
                break;

            case "Leave":
                eventHandle.eventName = 'mouseleave';
                eventHandle.cb = function (ev) {
                    self.triggerOnTarget(playerFrame, target, ev);
                };
                break;

            case "Hover":
                eventHandle.eventName = 'mouseover';
                eventHandle.cb = function (ev) {
                    self.triggerOnTarget(playerFrame, target, ev);
                };
                break;

        }

        self.eventHandlesForCleanUp.push(eventHandle);
        eventHandle.elem.on(eventHandle.eventName, eventHandle.cb);
    }


    for (var i = 0; i < this.targets().length; i++) {
        createEventListener(this.targets()[i]);
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerMouse.prototype.destroyOnPlayerFrame = function (playerFrame) {
    for (var i = 0; i < this.eventHandlesForCleanUp.length; i++) {
        var handle = this.eventHandlesForCleanUp[i];
        handle.elem.off(handle.eventName, handle.cb);
    }
    this.eventHandlesForCleanUp = [];
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerMouse.prototype.setPointers = function (entitiesArr) {
    this.targets(jQuery.map(this.targets(), function (id) {
        return entitiesArr.byId[id];
    }));
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerMouse.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerMouse}
 */
TriggerMouse.prototype.fromJS = function (data) {
    this.buttonType(data.buttonType);
    this.interactionType(data.interactionType);
    this.targets(data.targets);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerMouse.prototype.toJS = function () {
    return {
        type: this.type,
        buttonType: this.buttonType(),
        interactionType: this.interactionType(),
        targets: jQuery.map(this.targets(), function (element) { return element.id(); })
    };
};

////////////////////////


////////////////////////

/**
 * This Trigger handles mouse interactions with stimulus elements.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerEyetracking = function (event) {
    this.event = event;

    // serialized
    this.limitToTargets = ko.observable(false);
    this.targets = ko.observableArray([]);

    // not serialized:
    this.eventHandleForCleanUp = null;

};

TriggerEyetracking.prototype.type = "TriggerEyetracking";
TriggerEyetracking.prototype.label = "Eyetracking Trigger";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerEyetracking.prototype.isValid = function () {
    if (this.event.trigger()) {
        return true;
    }
    else {
        return false;
    }
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerEyetracking.prototype.getParameterSpec = function () {
    return [
        'Coordinate X',
        'Coordinate Y',
        'Coordinate [X,Y] Array',
        'Time From Frame Onset',
        'Stimulus Name',
        'Stimulus Info'
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the corresponding click handlers.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerEyetracking.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;

    this.eventHandleForCleanUp = function (coordX, coordY) {
        if (self.limitToTargets()) {
            var allTargets = self.targets();
            for (var i = 0; i < allTargets.length; i++) {
                var target = allTargets[i];
                if (target.modifier().selectedTrialView.isActive()) {

                    var elemX = target.modifier().selectedTrialView.editorX();
                    var elemY = target.modifier().selectedTrialView.editorY();

                    var elemWidth = target.modifier().selectedTrialView.editorWidth();
                    var elemHeight = target.modifier().selectedTrialView.editorHeight();

                    if (elemX < coordX && elemX + elemWidth > coordX && elemY < coordY && elemY + elemHeight > coordY) {
                        var stimulusInformation = null;
                        if (target.content().hasOwnProperty("stimulusInformation")) {
                            stimulusInformation = target.content().modifier().selectedTrialView.stimulusInformation();
                        }
                        self.event.triggerActions([
                            coordX,
                            coordY,
                            [coordX, coordY],
                            playerFrame.getFrameTime(),
                            target.name(),
                            stimulusInformation
                        ]);
                    }
                }
            }
        }
        else {
            self.event.triggerActions([
                coordX,
                coordY,
                [coordX, coordY],
                playerFrame.getFrameTime(),
                null,
                null
            ]);
        }
    };

    playerFrame.onEyetrackingCoords.push(this.eventHandleForCleanUp);

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerEyetracking.prototype.destroyOnPlayerFrame = function (playerFrame) {
    if (this.eventHandleForCleanUp) {
        var index = playerFrame.onEyetrackingCoords.indexOf(this.eventHandleForCleanUp);
        if (index > -1) {
            playerFrame.onEyetrackingCoords.splice(index, 1);
        }
        this.eventHandleForCleanUp = null;
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerEyetracking.prototype.setPointers = function (entitiesArr) {
    this.targets(jQuery.map(this.targets(), function (id) {
        return entitiesArr.byId[id];
    }));
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerEyetracking.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerEyetracking}
 */
TriggerEyetracking.prototype.fromJS = function (data) {
    this.limitToTargets(data.limitToTargets);
    this.targets(data.targets);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerEyetracking.prototype.toJS = function () {
    return {
        type: this.type,
        limitToTargets: this.limitToTargets(),
        targets: jQuery.map(this.targets(), function (element) { return element.id(); })
    };
};

////////////////////////


////////////////////////

/**
 * This Trigger handles mouse interactions with stimulus elements.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerButtonClick = function (event) {
    this.event = event;

    // serialized
    this.target = ko.observable(null);
    this.buttonIdx = ko.observable(0);

    // not serialized:
    this.eventHandleForCleanUp = null;

};

TriggerButtonClick.prototype.type = "TriggerButtonClick";
TriggerButtonClick.prototype.label = "Button Bar Trigger";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerButtonClick.prototype.isValid = function () {
    if (this.event.trigger() && this.target()) {
        return true;
    }
    else {
        return false;
    }
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerButtonClick.prototype.getParameterSpec = function () {
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
TriggerButtonClick.prototype.triggerOnTarget = function (playerFrame, target) {
    if (target.modifier().selectedTrialView.isActive()) {
        var stimulusInformation = null;
        if (target.content().hasOwnProperty("stimulusInformation")) {
            stimulusInformation = target.content().modifier().selectedTrialView.stimulusInformation();
        }
        this.event.triggerActions([
            target.name(),
            playerFrame.getFrameTime(),
            stimulusInformation
        ]);
    }
};

/**
 * this function is called in the player when the frame starts. It sets up the corresponding click handlers.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerButtonClick.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;
    var target = this.target();
    if (target) {
        var targetElem = $(playerFrame.frameView.viewElements.byId[target.id()].div);
        var buttonElem = $(targetElem.find('.navi-button'))[this.buttonIdx()];
        if (buttonElem === undefined) {
            buttonElem = $(targetElem).children()[this.buttonIdx()];
        }
        this.eventHandleForCleanUp = function (ev) {
            ev.stopImmediatePropagation();
            self.triggerOnTarget(playerFrame, target);
        };
        $(buttonElem).on("click", this.eventHandleForCleanUp);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerButtonClick.prototype.destroyOnPlayerFrame = function (playerFrame) {
    var target = this.target();
    if (target) {
        var targetViewElem = playerFrame.frameView.viewElements.byId[target.id()];
        if (targetViewElem) {
            var targetElem = $(targetViewElem.div);
            var buttonElem = $(targetElem.find('.navi-button'))[this.buttonIdx()];
            $(buttonElem).off("click", this.eventHandleForCleanUp);
            this.eventHandleForCleanUp = null;
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
TriggerButtonClick.prototype.setPointers = function (entitiesArr) {
    this.target(entitiesArr.byId[this.target()]);
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerButtonClick.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerButtonClick}
 */
TriggerButtonClick.prototype.fromJS = function (data) {
    this.buttonIdx(data.buttonIdx);
    this.target(data.target);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerButtonClick.prototype.toJS = function () {
    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }
    return {
        type: this.type,
        buttonIdx: this.buttonIdx(),
        target: targetId
    };
};

////////////////////////


/**
 * This Trigger handles keyboard interactions of the participant with the experiment.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerKeyboard = function (event) {
    var self = this;
    this.event = event;

    // serialized
    this.buttons = ko.observableArray([]);
    this.interactionType = ko.observable("Pressed");
    this.alphaNumericEnabled = ko.observable(false); // if true, then disable fullscreen in safari
    this.numpadEnabled = ko.observable(false);

    // not serialized:
    this.validKeyCodes = ko.computed(function () {
        return self.getValidKeyCodes();
    });
    this.eventHandleForCleanUp = null;

};

TriggerKeyboard.prototype.type = "TriggerKeyboard";
TriggerKeyboard.prototype.label = "Keyboard Trigger";
TriggerKeyboard.prototype.interactionTypes = ["PressDown", "PressUp"];

TriggerKeyboard.prototype.buttonTypesArrows = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];
TriggerKeyboard.prototype.buttonTypesNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
TriggerKeyboard.prototype.buttonTypesLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
TriggerKeyboard.prototype.buttonTypesSpecial = ["Space", "Enter", "Ctrl", "Tab", "Shift"];
TriggerKeyboard.prototype.buttonTypesFkeys = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10"];

TriggerKeyboard.prototype.buttonTypesArrowsCode = [37, 38, 39, 40];
TriggerKeyboard.prototype.buttonTypesNumbersCode = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
TriggerKeyboard.prototype.buttonTypesNumbersNumpadCode = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
TriggerKeyboard.prototype.buttonTypesLettersCode = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90];
TriggerKeyboard.prototype.buttonTypesSpecialCode = [32, 13, 17, 9, 16];
TriggerKeyboard.prototype.buttonTypesFkeysCode = [112, 113, 114, 115, 116, 117, 118, 119, 120, 121];

TriggerKeyboard.prototype.allKeys = TriggerKeyboard.prototype.buttonTypesFkeys.concat(TriggerKeyboard.prototype.buttonTypesSpecial.concat(TriggerKeyboard.prototype.buttonTypesLetters.concat(TriggerKeyboard.prototype.buttonTypesArrows.concat(TriggerKeyboard.prototype.buttonTypesNumbers))));
TriggerKeyboard.prototype.allKeysCode = TriggerKeyboard.prototype.buttonTypesFkeysCode.concat(TriggerKeyboard.prototype.buttonTypesSpecialCode.concat(TriggerKeyboard.prototype.buttonTypesLettersCode.concat(TriggerKeyboard.prototype.buttonTypesArrowsCode.concat(TriggerKeyboard.prototype.buttonTypesNumbersCode))));


/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerKeyboard.prototype.isValid = function () {
    if (this.event.trigger() && this.buttons().length > 0) {
        return true;
    }
    else {
        return false;
    }
};

/**
 * returns the validKeyCodes to which the player should listen.
 *
 * @returns {string[]}
 */
TriggerKeyboard.prototype.getValidKeyCodes = function () {

    var validKeyCodes = [];
    var validKeys = this.buttons();
    for (var i = 0; i < this.buttons().length; i++) {
        var index = TriggerKeyboard.prototype.allKeys.indexOf(validKeys[i]);
        validKeyCodes.push(TriggerKeyboard.prototype.allKeysCode[index]);
        // for numpad
        if (this.numpadEnabled()) {
            var number = parseInt(validKeys[i]);
            if (Number.isInteger(number)) {
                validKeyCodes.push(TriggerKeyboard.prototype.allKeysCode[index] + 48);
            }
        }

    }

    return validKeyCodes;
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerKeyboard.prototype.getParameterSpec = function () {
    return [
        'Id of Key'
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the corresponding keyboard handlers.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerKeyboard.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;
    var validKeyCodes = this.validKeyCodes();

    this.eventHandleForCleanUp = function (ev) {
        var keyIdx = validKeyCodes.indexOf(ev.keyCode);
        var anyAllowed = self.buttons().indexOf("any");
        if (keyIdx >= 0 || anyAllowed >= 0) {
            if (self.buttonTypesFkeysCode.indexOf(ev.keyCode) >= 0) {
                // only prevent default for F keys:
                ev.preventDefault();
            }
            if (anyAllowed >= 0) {
                self.event.triggerActions([ev.key.toUpperCase(), playerFrame.getFrameTime()]);
            }
            else {
                var pressedKey = self.buttons()[keyIdx];
                // for numpad numbers
                if (self.numpadEnabled()) {
                    if (!pressedKey && TriggerKeyboard.prototype.buttonTypesNumbersNumpadCode.indexOf(ev.keyCode) >= 0) {
                        pressedKey = String.fromCharCode(ev.keyCode - 48);
                    }
                }
                self.event.triggerActions([pressedKey, playerFrame.getFrameTime()]);
            }

            // ev.preventDefault();
            //return false;
        }
    };

    if (this.interactionType() === "PressDown") {
        $(document).on("keydown", this.eventHandleForCleanUp);
    }
    else { // PressUp
        $(document).on("keyup", this.eventHandleForCleanUp);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerKeyboard.prototype.destroyOnPlayerFrame = function (playerFrame) {
    if (this.interactionType() === "PressDown") {
        $(document).off("keydown", this.eventHandleForCleanUp);
    }
    else { // PressUp
        $(document).off("keyup", this.eventHandleForCleanUp);
    }
    this.eventHandleForCleanUp = null;
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerKeyboard.prototype.setPointers = function (entitiesArr) {

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerKeyboard.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerKeyboard}
 */
TriggerKeyboard.prototype.fromJS = function (data) {
    this.buttons(data.buttons);
    this.interactionType(data.interactionType);
    if (data.hasOwnProperty("numpadEnabled")) {
        this.numpadEnabled(data.numpadEnabled);
    }
    if (data.hasOwnProperty("alphaNumericEnabled")) {
        this.alphaNumericEnabled(data.alphaNumericEnabled);
    }
    else {
        // check if alpha numeric is used:
        var alphaNumericEnabled = false;
        $.each(this.buttons(), function (idx, buttonName) {
            var keyIdx = TriggerKeyboard.prototype.buttonTypesNumbers.indexOf(buttonName);
            if (keyIdx >= 0) {
                alphaNumericEnabled = true;
            }
        });
        $.each(this.buttons(), function (idx, buttonName) {
            var keyIdx = TriggerKeyboard.prototype.buttonTypesLetters.indexOf(buttonName);
            if (keyIdx >= 0) {
                alphaNumericEnabled = true;
            }
        });
        this.alphaNumericEnabled(alphaNumericEnabled);
    }
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerKeyboard.prototype.toJS = function () {
    return {
        type: this.type,
        buttons: this.buttons().slice(0),
        interactionType: this.interactionType(),
        alphaNumericEnabled: this.alphaNumericEnabled(),
        numpadEnabled: this.numpadEnabled(),
    };
};

////////////////////////







////////////////////////


/**
 * This Trigger handles keyboard interactions of the participant with the experiment.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerEnterOnInput = function (event) {
    var self = this;
    this.event = event;
    // serialized
    this.targets = ko.observableArray([]);
};

TriggerEnterOnInput.prototype.type = "TriggerEnterOnInput";
TriggerEnterOnInput.prototype.label = "Enter On Input";


/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerEnterOnInput.prototype.isValid = function () {
    if (this.event.trigger() && this.targets().length > 0) {
        return true;
    }
    else {
        return false;
    }
};



TriggerEnterOnInput.prototype.trigger = function (ev) {
    if (ev.key) {
        this.event.triggerActions([ev.key.toUpperCase(), player.currentFrame.getFrameTime()]);
    }
};

TriggerEnterOnInput.prototype.getParameterSpec = function () {
    return [
        'Id of Key'
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the corresponding keyboard handlers.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerEnterOnInput.prototype.setupOnPlayerFrame = function (playerFrame) {
    var returnKeyCode = 13;
    var self = this;
    this.targets().forEach(function (target) {
        target.content().executeByKeyCode.push(returnKeyCode);
        target.content().triggerRefernce = self;
    })
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerEnterOnInput.prototype.destroyOnPlayerFrame = function (playerFrame) {
    this.targets().forEach(function (target) {
        target.content().executeByKeyCode([]);
        target.content().triggerRefernce = null;
    });
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerEnterOnInput.prototype.setPointers = function (entitiesArr) {
    this.targets(jQuery.map(this.targets(), function (id) {
        return entitiesArr.byId[id];
    }));
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerEnterOnInput.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerMouse}
 */
TriggerEnterOnInput.prototype.fromJS = function (data) {
    this.targets(data.targets);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerEnterOnInput.prototype.toJS = function () {
    return {
        type: this.type,
        targets: jQuery.map(this.targets(), function (element) { return element.id(); })
    };
};

////////////////////////






/**
 * This Trigger is executed when the frame starts.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerOnFrameStart = function (event) {
    this.event = event;

    // not serialized
    this.callbackForCleanUp = null;

};

TriggerOnFrameStart.prototype.type = "TriggerOnFrameStart";
TriggerOnFrameStart.prototype.label = "On Frame Start Trigger";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerOnFrameStart.prototype.isValid = function () {
    return true;
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerOnFrameStart.prototype.getParameterSpec = function () {
    return [
    ];
};

/**
 * this function is called in the player when the frame starts. It directly triggers the actions.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerOnFrameStart.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;
    this.callbackForCleanUp = function () {
        self.event.triggerActions([]);
    };
    playerFrame.onFrameStartCallbacks.push(this.callbackForCleanUp);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerOnFrameStart.prototype.destroyOnPlayerFrame = function (playerFrame) {
    var index = playerFrame.onFrameStartCallbacks.indexOf(this.callbackForCleanUp);
    if (index > -1) {
        playerFrame.onFrameStartCallbacks.splice(index, 1);
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerOnFrameStart.prototype.setPointers = function (entitiesArr) {

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerOnFrameStart.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerOnFrameStart}
 */
TriggerOnFrameStart.prototype.fromJS = function (data) {
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerOnFrameStart.prototype.toJS = function () {
    return {
        type: this.type,
    };
};


////////////////////////









/**
 * This Trigger is executed when the frame starts.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerWebsocket = function (event) {
    this.event = event;
    this.msg = ko.observable("");

    // not serialized
    this.data = null;
    this.callbackForCleanUp = null;

};

TriggerWebsocket.prototype.type = "TriggerWebsocket";
TriggerWebsocket.prototype.label = "External Trigger";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerWebsocket.prototype.isValid = function () {
    return true;
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerWebsocket.prototype.getParameterSpec = function () {
    return [
        "Message",
        "Data"
    ];
};

/**
 * this function is called in the player when the frame starts. It directly triggers the actions.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */

TriggerWebsocket.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;
    this.callbackForCleanUp = function (msg, data) {
        self.data = data;
        self.msg(msg);
        self.event.triggerActions([msg, data]);
    };
    if (playerFrame.websocketTriggerCallbacks[this.msg()]) {
        playerFrame.websocketTriggerCallbacks[this.msg()].push(this.callbackForCleanUp)
    }
    else {
        playerFrame.websocketTriggerCallbacks[this.msg()] = [this.callbackForCleanUp]
    }
};


/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerWebsocket.prototype.destroyOnPlayerFrame = function (playerFrame) {
    var allCBs = playerFrame.websocketTriggerCallbacks;
    for (var member in allCBs) {
        delete allCBs[member];
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerWebsocket.prototype.setPointers = function (entitiesArr) {

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerWebsocket.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerOnFrameStart}
 */
TriggerWebsocket.prototype.fromJS = function (data) {
    this.msg(data.msg);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerWebsocket.prototype.toJS = function () {
    return {
        type: this.type,
        msg: this.msg()
    };
};


////////////////////////










/**
 * This Trigger is executed when the frame ends.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerOnFrameEnd = function (event) {
    this.event = event;

    // not serialized
    this.callbackForCleanUp = null;

};

TriggerOnFrameEnd.prototype.type = "TriggerOnFrameEnd";
TriggerOnFrameEnd.prototype.label = "On Frame End Trigger";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerOnFrameEnd.prototype.isValid = function () {
    return true;
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerOnFrameEnd.prototype.getParameterSpec = function () {
    return [
        "totalFrameTime"
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the frame end callback.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerOnFrameEnd.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;
    this.callbackForCleanUp = function () {
        self.event.triggerActions([playerFrame.getFrameTime()]);
    };
    playerFrame.onFrameEndCallbacks.push(this.callbackForCleanUp);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerOnFrameEnd.prototype.destroyOnPlayerFrame = function (playerFrame) {
    var index = playerFrame.onFrameEndCallbacks.indexOf(this.callbackForCleanUp);
    if (index > -1) {
        playerFrame.onFrameEndCallbacks.splice(index, 1);
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerOnFrameEnd.prototype.setPointers = function (entitiesArr) {

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerOnFrameEnd.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerOnFrameEnd}
 */
TriggerOnFrameEnd.prototype.fromJS = function (data) {
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerOnFrameEnd.prototype.toJS = function () {
    return {
        type: this.type
    };
};


////////////////////////

////////////////////////


/**
 * This Trigger is executed when the frame ends.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerOnGlobalEvent = function (event) {
    this.event = event;

    this.evtSubType = ko.observable(null);

    // not serialized
    this.callbackForCleanUp = null;

};

TriggerOnGlobalEvent.prototype.type = "TriggerOnGlobalEvent";
TriggerOnGlobalEvent.prototype.label = "Global Experiment Event";
TriggerOnGlobalEvent.prototype.triggerSubTypes = [
    {
        key: "expPaused",
        label: "Experiment Paused"
    },
    {
        key: "expContinued",
        label: "Experiment Continued"
    }
];

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerOnGlobalEvent.prototype.isValid = function () {
    return true;
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerOnGlobalEvent.prototype.getParameterSpec = function () {
    return [
        "totalFrameTime"
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the frame end callback.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerOnGlobalEvent.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;
    this.callbackForCleanUp = function (evtSubType) {
        if (self.evtSubType() == evtSubType) {
            self.event.triggerActions([playerFrame.getFrameTime()]);
        }
    };
    playerFrame.onGlobalEventCallbacks.push(this.callbackForCleanUp);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerOnGlobalEvent.prototype.destroyOnPlayerFrame = function (playerFrame) {
    var index = playerFrame.onGlobalEventCallbacks.indexOf(this.callbackForCleanUp);
    if (index > -1) {
        playerFrame.onGlobalEventCallbacks.splice(index, 1);
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerOnGlobalEvent.prototype.setPointers = function (entitiesArr) {

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerOnGlobalEvent.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerOnGlobalEvent}
 */
TriggerOnGlobalEvent.prototype.fromJS = function (data) {
    this.evtSubType(data.evtSubType);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerOnGlobalEvent.prototype.toJS = function () {
    return {
        type: this.type,
        evtSubType: this.evtSubType()
    };
};


////////////////////////

/**
 * This Trigger is executed when a timer reaches a specific value.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerTimerReached = function (event) {
    this.event = event;

    // serialized
    this.timerVar = ko.observable(null);
    this.timeInMs = ko.observable(0);
    this.repeat = ko.observable(false);

    // not serialized:
    this.triggerCallback = null;
};

TriggerTimerReached.prototype.type = "TriggerTimerReached";
TriggerTimerReached.prototype.label = "Timer Reached Trigger";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerTimerReached.prototype.isValid = function () {
    if (this.event.trigger() && !(this.timerVar() === null)) {
        return true;
    }
    else {
        return false;
    }
};


TriggerTimerReached.prototype.setVariableBackRef = function (variable) {
    variable.addBackRef(this, this.event, true, false, 'timer trigger');
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerTimerReached.prototype.getParameterSpec = function () {
    return [
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the corresponding timer callbacks.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerTimerReached.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;
    this.triggerCallback = function () {
        console.log("timer reached");
        self.event.triggerActions([]);
    };
    var timeInMs = parseInt(this.timeInMs());
    this.timerVar().value().addTriggerCallback(this.triggerCallback, timeInMs);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerTimerReached.prototype.destroyOnPlayerFrame = function (playerFrame) {
    if (this.triggerCallback) {
        this.timerVar().value().removeTriggerCallback(this.triggerCallback);
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerTimerReached.prototype.setPointers = function (entitiesArr) {
    var timerVar = entitiesArr.byId[this.timerVar()];
    if (timerVar) {
        this.timerVar(timerVar);
    }
    else {
        this.timerVar(null);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerTimerReached.prototype.reAddEntities = function (entitiesArr) {
    if (this.timerVar()) {
        if (!entitiesArr.byId.hasOwnProperty(this.timerVar().id())) {
            entitiesArr.push(this.timerVar());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerTimerReached}
 */
TriggerTimerReached.prototype.fromJS = function (data) {
    this.timerVar(data.timerVar);
    this.timeInMs(data.timeInMs);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerTimerReached.prototype.toJS = function () {
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
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var TriggerVariableValueChanged = function (event) {
    this.event = event;

    // serialized
    this.variables = ko.observableArray([]);

    // not serialized:
    this.subscriberHandles = [];
};

TriggerVariableValueChanged.prototype.type = "TriggerVariableValueChanged";
TriggerVariableValueChanged.prototype.label = "Variable Value Changed Trigger";

TriggerVariableValueChanged.prototype.setVariableBackRef = function (variable) {
    var self = this;
    variable.addBackRef(this, this.event, false, true, 'Trigger On Variable Change', function (globalVar) {
        self.removeVariable(globalVar);
    });
};




TriggerVariableValueChanged.prototype.removeVariable = function (variable) {
    this.variables.remove(variable);
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
TriggerVariableValueChanged.prototype.isValid = function () {
    if (this.event.trigger() && this.variables().length > 0) {
        return true;
    }
    else {
        return false;
    }
};

/**
 * Returns the parameters that this trigger will pass on to the requirements and actions.
 *
 * @returns {string[]}
 */
TriggerVariableValueChanged.prototype.getParameterSpec = function () {
    return [
        "newValue"
    ];
};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
TriggerVariableValueChanged.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;
    var variables = this.variables();
    for (var i = 0; i < variables.length; i++) {
        var subscribeHandle = variables[i].value().value.subscribe(function (newVal) {
            self.event.triggerActions([newVal]);
        });
        this.subscriberHandles.push(subscribeHandle);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
TriggerVariableValueChanged.prototype.destroyOnPlayerFrame = function (playerFrame) {
    for (var i = 0; i < this.subscriberHandles.length; i++) {
        this.subscriberHandles[i].dispose();
    }
    this.subscriberHandles = [];
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerVariableValueChanged.prototype.setPointers = function (entitiesArr) {
    var variableIds = this.variables();
    var variables = [];
    for (var i = 0; i < variableIds.length; i++) {
        var globVar = entitiesArr.byId[variableIds[i]];
        if (globVar) {
            variables.push(globVar);
            this.setVariableBackRef(globVar);
        }
    }
    this.variables(variables);
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerVariableValueChanged.prototype.reAddEntities = function (entitiesArr) {
    jQuery.each(this.variables(), function (index, elem) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);
    });
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {TriggerVariableValueChanged}
 */
TriggerVariableValueChanged.prototype.fromJS = function (data) {
    this.variables(data.variables);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
TriggerVariableValueChanged.prototype.toJS = function () {
    var variableIds = [];
    var variables = this.variables();
    for (var i = 0; i < variables.length; i++) {
        variableIds.push(variables[i].id());
    }

    return {
        type: this.type,
        variables: variableIds
    };
};

///////////////////////////


var TriggerOnContentElement = function (event) {
    this.event = event;

    // serialized
    this.target = ko.observable(null);
    this.triggerType = ko.observable(null);

    // not serialized:
    this.cb = null;
};

TriggerOnContentElement.prototype.type = "TriggerOnContentElement";
TriggerOnContentElement.prototype.label = "Content Element Triggers";

TriggerOnContentElement.prototype.getParameterSpec = function () {
    return [
    ];
};

TriggerOnContentElement.prototype.isValid = function () {
    if (this.event.trigger() && !(this.target() === null)) {
        return true;
    }
    else {
        return false;
    }
};

TriggerOnContentElement.prototype.setupOnPlayerFrame = function (playerFrame) {
    var self = this;
    this.cb = function () {
        self.event.triggerActions([]);
    };
    $(this.target()).on(this.triggerType(), this.cb);
};


TriggerOnContentElement.prototype.destroyOnPlayerFrame = function (playerFrame) {
    $(this.target()).off(this.triggerType(), this.cb);
    this.cb = null;
};


TriggerOnContentElement.prototype.setPointers = function (entitiesArr) {
    this.target(entitiesArr.byId[this.target()]);
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerOnContentElement.prototype.reAddEntities = function (entitiesArr) {

};

TriggerOnContentElement.prototype.fromJS = function (data) {
    this.target(data.target);
    this.triggerType(data.triggerType);
    return this;
};

TriggerOnContentElement.prototype.toJS = function () {
    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }
    return {
        type: this.type,
        target: targetId,
        triggerType: this.triggerType()
    };
};

////////////////////////




///////////////////////////


var TriggerOnUserLeave = function (event) {
    this.event = event;
    this.subscription = null

};

TriggerOnUserLeave.prototype.type = "TriggerOnUserLeave";
TriggerOnUserLeave.prototype.label = "User Leaves Experiment";

TriggerOnUserLeave.prototype.getParameterSpec = function () {
    return [
        "remainingNrParticipants"
    ];
};

TriggerOnUserLeave.prototype.isValid = function () {
    return true;
};

TriggerOnUserLeave.prototype.setupOnPlayerFrame = function (playerFrame) {

    var self = this;
    if (!this.subscription) {
        this.subscription = playerFrame.player.currentNumberParticipants.subscribe(function (newVal) {
            self.event.triggerActions([newVal]);
        });
    }

};


TriggerOnUserLeave.prototype.destroyOnPlayerFrame = function (playerFrame) {
    this.subscription.dispose();
};


TriggerOnUserLeave.prototype.setPointers = function (entitiesArr) {

};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerOnUserLeave.prototype.reAddEntities = function (entitiesArr) {

};

TriggerOnUserLeave.prototype.fromJS = function (data) {
    return this;
};

TriggerOnUserLeave.prototype.toJS = function () {
    return {
        type: this.type
    };
};

////////////////////////



var TriggerAudioVideoEvent = function (event) {
    this.event = event;

    // serialized
    this.target = ko.observable(null);
    this.triggerType = ko.observable(null);

    // not serialized:
    this.eventHandlesForCleanUp = [];

};

TriggerAudioVideoEvent.prototype.type = "TriggerAudioVideoEvent";
TriggerAudioVideoEvent.prototype.label = "Audio / Video Event Trigger";
TriggerAudioVideoEvent.prototype.triggerTypes = ["started", "paused", "ended"];


TriggerAudioVideoEvent.prototype.getParameterSpec = function () {
    return [
        "timeOfAudioVideo"
    ];
};

TriggerAudioVideoEvent.prototype.isValid = function () {
    if (this.event.trigger() && !(this.target() === null)) {
        return true;
    }
    else {
        return false;
    }
};

TriggerAudioVideoEvent.prototype.setupOnPlayerFrame = function (playerFrame) {

    var self = this;
    var cb;
    var elem = $(player.currentFrame.frameView.viewElements.byId[this.target().id()].div).find("audio, video");
    if (elem.length > 0) {
        switch (this.triggerType()) {
            case "started":
                cb = function () {
                    self.event.triggerActions([0]);
                };
                this.eventHandlesForCleanUp.push(cb);
                elem.on("play", cb);
                break;
            case "paused":
                cb = function () {
                    var currTime = elem[0].currentTime;
                    self.event.triggerActions([currTime]);
                };
                this.eventHandlesForCleanUp.push(cb);
                elem.on("pause", cb);
                break;
            case "ended":
                cb = function () {
                    var duration = elem[0].duration;
                    self.event.triggerActions([duration]);
                };
                this.eventHandlesForCleanUp.push(cb);
                elem.on("ended", cb);
                break;
        }
    }

};


TriggerAudioVideoEvent.prototype.destroyOnPlayerFrame = function (playerFrame) {
    var elem = $(playerFrame.frameView.viewElements.byId[this.target().id()].div).find("audio, video");
    for (var i = 0; i < this.eventHandlesForCleanUp.length; i++) {
        switch (this.triggerType()) {
            case "started":
                elem.off("play", this.eventHandlesForCleanUp[i]);
                break;
            case "paused":
                elem.off("pause", this.eventHandlesForCleanUp[i]);
                break;
            case "ended":
                elem.off("ended", this.eventHandlesForCleanUp[i]);
                break;
        }
    }
    this.eventHandlesForCleanUp = [];
};


TriggerAudioVideoEvent.prototype.setPointers = function (entitiesArr) {
    this.target(entitiesArr.byId[this.target()]);
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
TriggerAudioVideoEvent.prototype.reAddEntities = function (entitiesArr) {

};

TriggerAudioVideoEvent.prototype.fromJS = function (data) {
    this.target(data.target);
    this.triggerType(data.triggerType);
    return this;
};

TriggerAudioVideoEvent.prototype.toJS = function () {

    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }

    return {
        type: this.type,
        target: targetId,
        triggerType: this.triggerType()
    };
};

///////////////////////////

/**
 * Factory method that creates a new trigger based on the given trigger type.
 *
 * @param {ExpEvent} event - the parent event of the new action.
 * @param {string} type - the type of the Trigger (i.e. "TriggerVariableValueChanged")
 * @returns {Trigger}
 */
function triggerFactory(event, type) {
    var trigger = new window[type](event);
    return trigger;
}