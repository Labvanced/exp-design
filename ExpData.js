// � by Caspar Goeke and Holger Finger

/**
 * Stores all specifications of an experiment.
 * @constructor
 */
var ExpData = function () {
    this.expData = this; // self reference for consistency with other classes..
    this.entities = ko.observableArray([]).extend({sortById: null});
    this.groups = ko.observableArray([]).extend({sortById: null});
    this.expBlocks = ko.observableArray([]).extend({sortById: null});

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
    'varTaskIndex'
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
};

/**
 * adds a new subject group to the experiment.
 * @param group
 */
ExpData.prototype.addGroup = function(group) {
    return this.groups.push(group);
};

ExpData.prototype.rebuildEntities = function() {
    // first empty the entities list:
    this.entities([]);

    this.reAddEntities();
};

ExpData.prototype.addNewSubjGroup = function() {
    var group = new SubjectGroup(this);
    var session = new ExpSession(this);
    group.addSession(session);
    this.addGroup(group);
};

ExpData.prototype.addNewBlock = function() {

    var expTrialLoop = new ExpTrialLoop(this);
    expTrialLoop.initNewInstance();
    expTrialLoop.isInitialized(true);
    expTrialLoop.addNewFrame();

    // define instance of block element
    var blockElements = [
        new StartBlock(this),
        new TextEditorData(this),
        new QuestionnaireEditorData(this),
        expTrialLoop,
        new QuestionnaireEditorData(this),
        new TextEditorData(this),
        new EndBlock(this)
    ];

    // define the names of each of the elements
    var blockNames = [

        'Start',
        'Instructions',
        'Pre-Questionaire',
        'Trial-Loop',
        'Post-Questionaire',
        'Feedback',
        'End'

    ];

    // add fixed instances of block into sequence
    var block = new ExpBlock(this);



    var name= "block_"+(this.expBlocks().length+1);
    block.name(name);
    var subSequence = block.subSequence();
    var xPosition = -60;
    var yPosition = 100;
    for (var i = 0; i<blockElements.length;i++){
        blockElements[i].name(blockNames[i]);
        xPosition += 160;
        blockElements[i].editorX(xPosition);
        blockElements[i].editorY(yPosition);
        subSequence.addNewSubElement(blockElements[i]);

        if (i<blockElements.length-1) {
            // add connection to next element:
            var conn = new Connection(this);

            // specify executeOut port:
            var portId = null;
            var ports = blockElements[i].portHandler.ports();
            for (var k=0; k<ports.length; k++){
                if (ports[k].portType() == 'executeOut'){
                    portId = ports[k].id();
                    break;
                }
            }
            conn.conn1({
                id: blockElements[i].id(),
                portId: portId
            });

            if (blockNames[i] == 'Trial-Loop'){
                // trial randomization, premade variable per exp trial loop
                var trialUniqueId = new GlobalVar(this.expData);
                trialUniqueId.dataType('numeric');
                trialUniqueId.scope('trial');
                trialUniqueId.scale('nominal');
                trialUniqueId.name("Trial Id");
                blockElements[i].trialUniqueIdVar(trialUniqueId);

                var trialTypeIdVar = new GlobalVar(this.expData);
                trialTypeIdVar.dataType('numeric');
                trialTypeIdVar.scope('trial');
                trialTypeIdVar.scale('nominal');
                trialTypeIdVar.name("Trial Type");
                blockElements[i].trialTypeIdVar(trialTypeIdVar);

                var trialOrderVar = new GlobalVar(this.expData);
                trialOrderVar.dataType('numeric');
                trialOrderVar.scope('trial');
                trialOrderVar.scale('interval');
                trialOrderVar.name("Presentation Order");
                blockElements[i].trialOrderVar(trialOrderVar);

            }
            // specify executeIn port:
            var portId = null;
            var ports = blockElements[i+1].portHandler.ports();
            for (var k=0; k<ports.length; k++){
                if (ports[k].portType() == 'executeIn'){
                    portId = ports[k].id();
                    break;
                }
            }
            conn.conn2({
                id: blockElements[i + 1].id(),
                portId: portId
            });

            conn.parent = subSequence;

            
            subSequence.addNewSubElement(conn);
        }

    }



    for (var i = 0; i<subSequence.elements().length;i++){

        if (subSequence.elements()[i].type == "Connection"){
            conn.makeConnection();
        }

    }


    // link block into all sessions
    var groups = this.groups();
    for (var i = 0;i<groups.length;i++){
        var sessions = groups[i].sessions();
        for (var k = 0;k<sessions.length;k++){
            sessions[k].addBlock(block);
        }
    }

    this.expBlocks.push(block);

    this.reAddEntities();
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
    var allEntitiesArray = this.entities();
    jQuery.each( allEntitiesArray, function( index, elem ) {
        elem.setPointers(self.entities);
    } );

    for (var i=0; i < ExpData.prototype.fixedVarNames.length; i++){
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

    // add the groups and their child nodes to entities:
    jQuery.each( this.groups(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        elem.reAddEntities(entitiesArr);
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

    this.groups([]);
    if (data.hasOwnProperty('entities')) {
        this.entities(jQuery.map(data.entities, function (entityJson) {
            var entity = entityFactory(entityJson, self);

            switch (entityJson.type) {
                case 'SubjectGroup':
                    self.groups.push(entity);
                    break;
                case 'ExpBlock':
                    self.expBlocks.push(entity);
                    break;
            }

            return entity;
        }));
    }

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
    // make sure that we have an up to date global list of all entities:
    this.rebuildEntities();

    var sessionsPerGroup = [];
    var groups = this.groups();
    for (var i=0; i<groups.length; i++){
        sessionsPerGroup.push(groups[i].sessions().length);
    }

    var data = {
        entities: jQuery.map( this.entities(), function( entity ) { return entity.toJS(); }),
        numGroups: this.groups().length,
        sessionsPerGroup: sessionsPerGroup
    };

    // add all variable ids:
    for (var i=0; i < ExpData.prototype.fixedVarNames.length; i++){
        var varName = ExpData.prototype.fixedVarNames[i];
        data[varName] = this[varName]().id();
    }

    return data;
};