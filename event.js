// � by Caspar Goeke and Holger Finger

/**
 * An event defines all kinds of experimental logic and responsive feedback to the participant. The event is a container
 * that combines a certain trigger with several actions and requirements.
 *
 * @param {FrameData | PageData} parent - the frame or page where this event is defined.
 * @constructor
 */
var Event= function(parent) {
    this.parent = parent;

    // serialized
    //this.id = ko.observable(guid());
    this.type = "Event";
    this.trigger = ko.observable(null);
    this.requirement = ko.observable(new RequirementAND(this));
    this.actions = ko.observableArray([]);
    this.name =  ko.observable(null);


};


/**
 * deletes all requirements.
 */
Event.prototype.deleteRequirement = function() {
    this.requirement(null);
};

/**
 * delete the action at the specified index.
 * @param {number} index
 */
Event.prototype.deleteAction = function(index) {
    this.actions.splice(index, 1);
};

/**
 * the event is triggered via this function. If the requirmenets are fullfilled then it starts the actions.
 * @param parameters
 */
Event.prototype.triggerActions = function(parameters) {
    if (this.requirement()==null || this.requirement().checkIfTrue()) {

        this.runActions(parameters);
    }
};

/**
 * runs all actions.
 * @param parameters
 */
Event.prototype.runActions = function(parameters) {
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
    if (this.requirement()) {
        this.requirement().setPointers(entitiesArr);
    }
    var actions = this.actions();

    // resort actions (make sure jump to is at the end)
    var jumpPos = null;
    for (var i =0; i<actions.length;i++){
        if (actions[i] instanceof ActionJumpTo){
            jumpPos  = i;
            break;
        }
    }
    if (jumpPos < actions.length-1){
        var temp = actions[i];
        actions.splice(jumpPos,1);
        actions.push(temp);
    }

    for (var i=0; i<actions.length; i++) {
        actions[i].setPointers(entitiesArr);
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
    if (this.requirement() && this.requirement().reAddEntities) {
        this.requirement().reAddEntities(entitiesArr);
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

    if (data.requirement) {
        var requirement = requirementFactory(self, data.requirement.type);
        requirement.fromJS(data.requirement);
        this.requirement(requirement);
    }

    var actions = [];
    for (var i=0; i<data.actions.length; i++) {
        var action = actionFactory(self, data.actions[i].type);
        action.fromJS(data.actions[i]);
        actions.push(action);
    }
    this.actions(actions);

    return this;
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
    
    var req = null;
    if (this.requirement()) {
        req = this.requirement().toJS();
    }

    return {
        //id: this.id(),
        name:this.name(),
        type: this.type,
        trigger: this.trigger().toJS(),
        requirement: req,
        actions: actionData
    };
};

