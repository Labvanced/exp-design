// � by Caspar Goeke and Holger Finger

/**
 * An event defines all kinds of experimental logic and responsive feedback to the participant. The event is a container
 * that combines a certain trigger with several actions.
 *
 * @param {FrameData | PageData} parent - the frame or page where this event is defined.
 * @constructor
 */
var ExpEvent = function (parent) {
    this.parent = parent;

    var self = this;
    // serialized
    this.type = "ExpEvent";
    this.trigger = ko.observable(null);
    this.actions = ko.observableArray([]);
    this.name = ko.observable(null);
    this.description = ko.observable('event description');

    this.shortName = ko.computed(function () {
        if (self.name()) {
            return (self.name().length > 13 ? self.name().substring(0, 12) + '...' : self.name());
        }
        else return '';
    });

    // not serialized:
    this.isPaused = false;

};

/**
 * delete the action at the specified index.
 * @param {number} index
 */
// TODO: unused
ExpEvent.prototype.deleteAction = function (index) {
    this.actions.splice(index, 1);
};


ExpEvent.prototype.startPause = function (playerFrame) {
    this.isPaused = true;
    var actionsArr = [];
    this.getAllActions(actionsArr);
    $.each(actionsArr, function (idx, action) {
        if (typeof action.startPause === "function") {
            action.startPause(playerFrame);
        }
    });
};

ExpEvent.prototype.stopPause = function (playerFrame) {
    this.isPaused = false;
    var actionsArr = [];
    this.getAllActions(actionsArr);
    $.each(actionsArr, function (idx, action) {
        if (typeof action.stopPause === "function") {
            action.stopPause(playerFrame);
        }
    });
};

ExpEvent.prototype.moveActionDown = function (index, actionsObsArr) {
    this.moveAction(index, "Down", actionsObsArr);
};

ExpEvent.prototype.moveActionUp = function (index, actionsObsArr) {
    this.moveAction(index, "Up", actionsObsArr);
};

ExpEvent.prototype.moveAction = function (index, UpOrDown, actionsObsArr) {
    if (UpOrDown == "Up" && index < actionsObsArr().length - 1) {
        var elem = actionsObsArr.splice(index, 1)[0];
        actionsObsArr.splice(index + 1, 0, elem);
    }
    else if (UpOrDown == "Down" && index > 0) {
        var elem = actionsObsArr.splice(index, 1)[0];
        actionsObsArr.splice(index - 1, 0, elem);
    }
    this.parent.expData.notifyChanged();
};


/**
 * the event is triggered via this function.
 * @param parameters
 */
ExpEvent.prototype.triggerActions = function (parameters) {
    if (!this.isPaused) {
        var actions = this.actions();
        for (var i = 0; i < actions.length; i++) {
            actions[i].run(parameters);
        }
    }
};

/**
 * recursively fill arr with all nested sub actions
 */
ExpEvent.prototype.getAllActions = function (arr) {
    var actions = this.actions();
    for (var i = 0; i < actions.length; i++) {
        arr.push(actions[i]);
        if (typeof actions[i].getAllActions === "function") {
            actions[i].getAllActions(arr);
        }
    }
};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ExpEvent.prototype.setupOnPlayerFrame = function (playerFrame) {
    this.trigger().setupOnPlayerFrame(playerFrame);
    var actions = this.actions();
    for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if (typeof action.setupOnPlayerFrame === "function") {
            action.setupOnPlayerFrame(playerFrame);
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
ExpEvent.prototype.setPointers = function (entitiesArr) {
    this.trigger().setPointers(entitiesArr);

    var actions = this.actions();
    for (var i = 0; i < actions.length; i++) {
        actions[i].setPointers(entitiesArr);
    }

    // check if conversion necessary from old navigation element:
    if (this.trigger().type === 'TriggerMouse') {
        var targets = this.trigger().targets();
        if (targets.length > 0) {
            if (targets[0].content() instanceof NaviElement) {
                console.log("converting from trigger type TriggerMouse to trigger type TriggerButtonClick...");
                var newTrigger = new TriggerButtonClick(this);
                newTrigger.target(targets[0]);
                if (this.actions()[0] instanceof ActionJumpTo) {
                    if (this.actions()[0].jumpType() == "nextFrame") {
                        newTrigger.buttonIdx(1);
                    }
                    else {
                        newTrigger.buttonIdx(0);
                    }
                    this.trigger(newTrigger);
                }

            }
        }
    }

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpEvent.prototype.reAddEntities = function (entitiesArr) {
    if (this.trigger() && this.trigger().reAddEntities) {
        this.trigger().reAddEntities(entitiesArr);
    }
    jQuery.each(this.actions(), function (index, elem) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    });
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ExpEvent}
 */
ExpEvent.prototype.fromJS = function (data) {
    var self = this;

    //this.id(data.id);
    this.name(data.name);

    var trigger = triggerFactory(self, data.trigger.type);
    trigger.fromJS(data.trigger);
    this.trigger(trigger);

    var actions = [];
    for (var i = 0; i < data.actions.length; i++) {
        var action = actionFactory(self, data.actions[i].type);
        action.fromJS(data.actions[i]);
        actions.push(action);
    }
    this.actions(actions);
    if (data.hasOwnProperty('description')) {
        this.description(data.description);
    }

    if (data.requirement) {
        this.requirementConverter(data);
    }




    return this;
};

ExpEvent.prototype.requirementConverter = function (data) {
    var requirement = requirementFactory(this, data.requirement.type);
    requirement.fromJS(data.requirement);

    if (data.requirement.childRequirements.length > 0) {
        var actions = this.actions();
        this.actions([]);
        var wrapperAction = new ActionConditional(this);
        wrapperAction.ifElseConditions()[0].requirement(requirement);
        wrapperAction.ifElseConditions()[0].subActions(actions);
        this.actions.push(wrapperAction);
    }
};


/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ExpEvent.prototype.toJS = function () {
    var actions = this.actions();
    var actionData = [];
    for (var i = 0; i < actions.length; i++) {
        actionData.push(actions[i].toJS());
    }

    return {
        name: this.name(),
        type: this.type,
        trigger: this.trigger().toJS(),
        actions: actionData,
        description: this.description()
    };
};


/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ExpEvent.prototype.destroyOnPlayerFrame = function (playerFrame) {
    try {
        this.trigger().destroyOnPlayerFrame(playerFrame);
    }
    catch (err) {
        console.error("error during this.trigger().destroyOnPlayerFrame(playerFrame)")
    }

    var actions = this.actions();
    for (var i = 0; i < actions.length; i++) {
        try {
            actions[i].destroyOnPlayerFrame(playerFrame);
        }
        catch (err) {
            console.error("error during actions[i].destroyOnPlayerFrame(playerFrame)")
        }
    }
};
