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

    var self = this;
    // serialized
    //this.id = ko.observable(guid());
    this.type = "Event";
    this.trigger = ko.observable(null);
    this.requirement = ko.observable(new RequirementAND(this));
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
 * deletes all requirements.
 */
Event.prototype.deleteRequirement = function() {
    this.requirement(new RequirementAND(this));
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
    this.checkRequirementAndRun(parameters,this.actions());
};

/**
 * runs all actions.
 * @param parameters
 */
Event.prototype.checkRequirementAndRun = function(parameters,actions) {

    for (var i=0; i<actions.length; i++) {
        if (actions[i] instanceof ActionConditional){
            var conditionalAction = actions[i];
            var ifElseConditions = conditionalAction.ifElseConditions();
            var foundTrueCase = false;
            var caseIndex = 0;
            while (foundTrueCase ==false && caseIndex<=ifElseConditions.length){
                var requirement = ifElseConditions[caseIndex].requirement();
                var actionList = ifElseConditions[caseIndex].subActions();
                if (requirement==null || requirement.checkIfTrue(parameters)) {
                    foundTrueCase = true;
                    for (var j=0; j<actionList.length; j++) {
                        actionList[j].run(parameters);
                    }

                }
                caseIndex ++;
            }
            if (foundTrueCase==false && conditionalAction.defaultConditionActive()){
                var actionList = conditionalAction.defaultSubActions();
                for (var j=0; j<actionList.length; j++) {
                    actionList[j].run(parameters);
                }
            }

        }
        else{
            actions[i].run(parameters);
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
Event.prototype.setPointers = function(entitiesArr) {
    this.trigger().setPointers(entitiesArr);
    if (this.requirement()) {
        this.requirement().setPointers(entitiesArr);
    }
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

    var actions = [];
    for (var i=0; i<data.actions.length; i++) {
        var action = actionFactory(self, data.actions[i].type);
        action.fromJS(data.actions[i]);
        actions.push(action);
    }
    this.actions(actions);


    if (data.requirement) {
        var requirement = requirementFactory(self, data.requirement.type);
        requirement.fromJS(data.requirement);
        this.requirement(requirement);

        this.requirementConverter(data);
    }

    return this;
};

Event.prototype.requirementConverter = function(data) {

    if (data.requirement.childRequirements.length>0){
        var requirement = this.requirement();
        this.requirement(null);
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

