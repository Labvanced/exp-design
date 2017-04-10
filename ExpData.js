// � by Caspar Goeke and Holger Finger

/**
 * Stores all specifications of an experiment.
 * @constructor
 */
var ExpData = function (parentExperiment) {
    this.parentExperiment = parentExperiment;

    this.expData = this; // self reference for consistency with other classes..

    // entities hold all instances that have an id field:
    this.entities = ko.observableArray([]).extend({sortById: null});

    this.availableTasks  = ko.observableArray([]);
    this.availableBlocks = ko.observableArray([]);
    this.availableSessions = ko.observableArray([]);
    this.availableGroups = ko.observableArray([]);
    
    //TODO  need to serialize / deserialize
    this.translations = ko.observableArray([]);

    // the following variables are recorded once per subject:
    this.varSubjectId =  ko.observable();
    this.varSubjectIndex =  ko.observable();
    this.varGroupId =  ko.observable();
    // the following variables are recorded once per task:
    this.varSessionTimeStamp =  ko.observable();
    this.varSessionId =  ko.observable();
    this.varSessionIndex =  ko.observable();
    this.varBlockId =  ko.observable();
    this.varBlockIndex =  ko.observable();
    this.varTaskId =  ko.observable();
    this.varTaskIndex =  ko.observable();

    this.varTrialId =  ko.observable();
    this.varTaskIdx =  ko.observable();
    this.varCondition =  ko.observable();

    this.vars = ko.computed(function() {
        var varArray = [];
        for (var i=0; i < ExpData.prototype.fixedVarNames.length; i++){
            varArray.push( this[ExpData.prototype.fixedVarNames[i]]());
        }
        return varArray;
    }, this);
};

ExpData.prototype.fixedVarNames = [
    'varSubjectId',
    'varSubjectIndex',
    'varGroupId',
    'varSessionTimeStamp',
    'varSessionId',
    'varSessionIndex',
    'varBlockId',
    'varBlockIndex',
    'varTaskId',
    'varTaskIndex',
    'varTrialId',
    'varTaskIdx',
    'varCondition'
];

/**
 * creates all predefined (fixed) variables
 */
ExpData.prototype.createVars = function() {
    this.varSubjectId((new GlobalVar(this.expData)).initProperties('string', 'subject', 'nominal', 'Subject Id'));
    this.varSubjectIndex((new GlobalVar(this.expData)).initProperties('numeric', 'subject', 'nominal', 'Subject Index'));
    this.varGroupId((new GlobalVar(this.expData)).initProperties('string', 'subject', 'nominal', 'Group Id'));
    this.varSessionTimeStamp((new GlobalVar(this.expData)).initProperties('datetime', 'task', 'ordinal', 'Session Start Time'));
    this.varSessionId((new GlobalVar(this.expData)).initProperties('string', 'task', 'nominal', 'Session Id'));
    this.varSessionIndex((new GlobalVar(this.expData)).initProperties('numeric', 'task', 'nominal', 'Session Index'));
    this.varBlockId((new GlobalVar(this.expData)).initProperties('string', 'task', 'nominal', 'Block Id'));
    this.varBlockIndex((new GlobalVar(this.expData)).initProperties('numeric', 'task', 'nominal', 'Block Index'));
    this.varTaskId((new GlobalVar(this.expData)).initProperties('string', 'task', 'nominal', 'Task Id'));
    this.varTaskIndex((new GlobalVar(this.expData)).initProperties('numeric', 'task', 'nominal', 'Task Index'));
    this.varTrialId((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'nominal', 'Trial Id'));
    this.varTaskIdx((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'interval', 'Trial Index'));
    this.varCondition((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'nominal', 'Condition'));
};

/**
 * should be called by the ui classes after a change was made to some sub datamodels of this expData.
 */
ExpData.prototype.notifyChanged = function() {
    this.parentExperiment.notifyChanged();
};

/**
 * adds a new subject group to the experiment.
 * @param group
 */
ExpData.prototype.addGroup = function(group) {
    this.availableGroups.push(group);
    this.notifyChanged();
};

ExpData.prototype.rebuildEntities = function() {
    // first empty the entities list:
    this.entities([]);
    this.reAddEntities();
};

ExpData.prototype.addNewSubjGroup = function() {
    var group = new SubjectGroup(this);
    var name = "group_" + (this.availableGroups().length+1);
    group.name(name);
    this.addGroup(group);
};

ExpData.prototype.addTask = function(taskName) {

    var expTrialLoop = new ExpTrialLoop(this);
    expTrialLoop.initNewInstance();
    expTrialLoop.isInitialized(true);
    if (taskName){
        expTrialLoop.name(taskName);
    }
    this.availableTasks.push(expTrialLoop);
    this.reAddEntities();
    this.notifyChanged();
};


ExpData.prototype.addNewBlock_Refactored = function() {
    
    // add fixed instances of block into sequence
    var block = new ExpBlock(this);
    var name= "block_"+(this.availableBlocks().length+1);
    block.name(name);
    this.availableBlocks.push(block);
    this.notifyChanged();
};

ExpData.prototype.addNewSession = function() {

    // add fixed instances of block into sequence
    var session = new ExpSession(this);
    var name= "session_"+(this.availableSessions().length+1);
    session.name(name);
    this.availableSessions.push(session);
    this.notifyChanged();
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpData.prototype.setPointers = function() {
    var self = this;
    var i;
    var allEntitiesArray = this.entities();

    // recursively call all setPointers:
    jQuery.each( allEntitiesArray, function( index, elem ) {
        elem.setPointers(self.entities);
    } );

    // relink availableTasks:
    var availableTaskIds = this.availableTasks();
    var availableTasks = [];
    for (i=0; i<availableTaskIds.length; i++) {
        availableTasks.push(this.entities.byId[availableTaskIds[i]]);
    }
    this.availableTasks(availableTasks);

    // relink availableBlocks:
    var availableBlockIds = this.availableBlocks();
    var availableBlocks = [];
    for (i=0; i<availableBlockIds.length; i++) {
        availableBlocks.push(this.entities.byId[availableBlockIds[i]]);
    }
    this.availableBlocks(availableBlocks);

    // relink availableSessions:
    var availableSessionIds = this.availableSessions();
    var availableSessions = [];
    for (i=0; i<availableSessionIds.length; i++) {
        availableSessions.push(this.entities.byId[availableSessionIds[i]]);
    }
    this.availableSessions(availableSessions);

    // relink availableGroups:
    var availableGroupIds = this.availableGroups();
    var availableGroups = [];
    for (i=0; i<availableGroupIds.length; i++) {
        availableGroups.push(this.entities.byId[availableGroupIds[i]]);
    }
    this.availableGroups(availableGroups);

    // relink variables
    for (i=0; i < ExpData.prototype.fixedVarNames.length; i++){
        var varId = this[ExpData.prototype.fixedVarNames[i]]();
        var varInstance = this.entities.byId[varId];
        this[ExpData.prototype.fixedVarNames[i]](varInstance);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpData.prototype.reAddEntities = function() {
    var entitiesArr = this.entities;

    jQuery.each( this.availableTasks(), function( index, task ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(task.id())) {
            entitiesArr.push(task);
        }
        // recursively make sure that all deep tree nodes are in the entities list:
        task.reAddEntities(entitiesArr);
    } );

    jQuery.each( this.availableBlocks(), function( index, block ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(block.id())) {
            entitiesArr.push(block);
        }
        // recursively make sure that all deep tree nodes are in the entities list:
        block.reAddEntities(entitiesArr);
    } );

    jQuery.each( this.availableSessions(), function( index, session ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(session.id())) {
            entitiesArr.push(session);
        }
        // recursively make sure that all deep tree nodes are in the entities list:
        session.reAddEntities(entitiesArr);
    } );

    jQuery.each( this.availableGroups(), function( index, group ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(group.id()))
            entitiesArr.push(group);

        // recursively make sure that all deep tree nodes are in the entities list:
        group.reAddEntities(entitiesArr);
    } );

    for (var i=0; i < ExpData.prototype.fixedVarNames.length; i++){
        var varInstance = this[ExpData.prototype.fixedVarNames[i]]();
        if (!entitiesArr.byId.hasOwnProperty(varInstance.id())) {
            entitiesArr.push(varInstance);
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ExpData}
 */
ExpData.prototype.fromJS = function(data) {
    var self = this;

    if (data.hasOwnProperty('entities')) {
        this.entities(jQuery.map(data.entities, function (entityJson) {
            return entityFactory(entityJson, self);
        }));
    }

    this.availableTasks(data.availableTasks);
    this.availableBlocks(data.availableBlocks);
    this.availableSessions(data.availableSessions);
    this.availableGroups(data.availableGroups);

    for (var i=0; i < ExpData.prototype.fixedVarNames.length; i++){
        var varName = ExpData.prototype.fixedVarNames[i];
        this[varName](data[varName]);
    }

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ExpData.prototype.toJS = function() {
    var i;

    // make sure that we have an up to date global list of all entities:
    this.rebuildEntities();

    var sessionsPerGroup = [];
    var groups = this.availableGroups();
    for (i=0; i<groups.length; i++){
        sessionsPerGroup.push(groups[i].sessions().length);
    }


    var data = {
        entities: jQuery.map( this.entities(), function( entity ) { return entity.toJS(); }),
        availableTasks: jQuery.map( this.availableTasks(), function( task ) { return task.id(); }),
        availableBlocks: jQuery.map( this.availableBlocks(), function( block ) { return block.id(); }),
        availableSessions: jQuery.map( this.availableSessions(), function( session ) { return session.id(); }),
        availableGroups: jQuery.map( this.availableGroups(), function( group ) { return group.id(); }),
        numGroups: this.availableGroups().length,
        sessionsPerGroup: sessionsPerGroup
    };

    // add all variable ids:
    for (i=0; i < ExpData.prototype.fixedVarNames.length; i++){
        var varName = ExpData.prototype.fixedVarNames[i];
        data[varName] = this[varName]().id();
    }

    return data;
};