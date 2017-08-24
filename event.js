// � by Caspar Goeke and Holger Finger

/**
 * An event defines all kinds of experimental logic and responsive feedback to the participant. The event is a container
 * that combines a certain trigger with several actions.
 *
 * @param {FrameData | PageData} parent - the frame or page where this event is defined.
 * @constructor
 */
var Event= function(parent) {
    this.parent = parent;

    var self = this;
    // serialized
    this.type = "Event";
    this.trigger = ko.observable(null);
    this.actions = ko.observableArray([]);
    this.name =  ko.observable(null);

    this.shortName = ko.computed(function() {
        if (self.name()){
            return (self.name().length > 13 ? self.name().substring(0, 12) + '...' : self.name());
        }
        else return '';
    });

};

/**
 * delete the action at the specified index.
 * @param {number} index
 */
Event.prototype.deleteAction = function(index) {
    this.actions.splice(index, 1);
};

/**
 * the event is triggered via this function.
 * @param parameters
 */
Event.prototype.triggerActions = function(parameters) {
    var actions = this.actions();
    for (var i=0; i<actions.length; i++) {
        actions[i].run(parameters);
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Event.prototype.setPointers = function(entitiesArr) {
    this.trigger().setPointers(entitiesArr);

    var actions = this.actions();
    for (var i=0; i<actions.length; i++) {
        actions[i].setPointers(entitiesArr);
    }

    // check if conversion necessary from old navigation element:
    if (this.trigger().type === 'TriggerMouse') {
        var targets = this.trigger().targets();
        if (targets.length>0) {
            if (targets[0].content() instanceof NaviElement) {
                console.log("converting from trigger type TriggerMouse to trigger type TriggerButtonClick...");
                var newTrigger = new TriggerButtonClick(this);
                newTrigger.target(targets[0]);
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

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Event.prototype.reAddEntities = function(entitiesArr) {
    if (this.trigger() && this.trigger().reAddEntities) {
        this.trigger().reAddEntities(entitiesArr);
    }
    jQuery.each( this.actions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Event}
 */
Event.prototype.fromJS = function(data) {
    var self = this;

    //this.id(data.id);
    this.name(data.name);

    var trigger = triggerFactory(self, data.trigger.type);
    trigger.fromJS(data.trigger);
    this.trigger(trigger);

    var actions = [];
    for (var i=0; i<data.actions.length; i++) {
        var action = actionFactory(self, data.actions[i].type);
        action.fromJS(data.actions[i]);
        actions.push(action);
    }
    this.actions(actions);


    if (data.requirement) {
        this.requirementConverter(data);
    }

    return this;
};

Event.prototype.requirementConverter = function(data) {
    var requirement = requirementFactory(this, data.requirement.type);
    requirement.fromJS(data.requirement);

    if (data.requirement.childRequirements.length>0){
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
Event.prototype.toJS = function() {
    var actions = this.actions();
    var actionData = [];
    for (var i=0; i<actions.length; i++) {
        actionData.push(actions[i].toJS());
    }

    return {
        name:this.name(),
        type: this.type,
        trigger: this.trigger().toJS(),
        actions: actionData
    };
};


/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
Event.prototype.destroyOnPlayerFrame = function(playerFrame) {
    this.trigger().destroyOnPlayerFrame(playerFrame);
    var actions = this.actions();
    for (var i = 0; i < actions.length; i++){
        actions[i].destroyOnPlayerFrame(playerFrame);
    }
};