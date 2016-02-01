// � by Caspar Goeke and Holger Finger

var ExpData = function () {
    this.expData = this; // self reference for consistency with other classes..
    this.entities = ko.observableArray([]).extend({sortById: null});
    this.groups = ko.observableArray([]).extend({sortById: null});
    this.expBlocks = ko.observableArray([]).extend({sortById: null});
    this.globalVars = ko.observableArray([]).extend({sortById: null});
    this.visibleVars =  ko.observableArray([]).extend({sortById: null});
    this.variables= [
        {name: 'Experiment Name', type: 'id', dataType:'string',scope:'experiment'},
        {name: 'Subject Id', type: 'id', dataType:'string',scope:'experiment'},
        {name: 'Group Id', type: 'id', dataType:'string',scope:'experiment' },
        {name: 'Time Stamp', type: 'id', dataType:'string',scope:'session'},
        {name: 'Session Number', type: 'id' , dataType:'numeric',scope:'session'},
        {name: 'Block Order', type: 'randomization', dataType:'string array',scope:'session'}
    ];
    this.setVisibleVars();
};




ExpData.prototype.setPointers = function() {
    var allEntitiesArray = this.entities();
    jQuery.each( allEntitiesArray, function( index, elem ) {
        elem.setPointers();
    } );
};

ExpData.prototype.setVisibleVars = function() {

    for (var i = 0; i<this.variables.length;i++){
        var globalVar = new GlobalVar(this.expData);
        globalVar.subtype(this.variables[i].type);
        globalVar.dataType(this.variables[i].dataType);
        globalVar.name(this.variables[i].name);
        globalVar.scope(this.variables[i].scope);
        this.visibleVars.push(globalVar);
    }

};

ExpData.prototype.addGlobalVar = function(variable) {
    return this.globalVars.push(variable);
};

ExpData.prototype.addGroup = function(group) {
    return this.groups.push(group);
};

ExpData.prototype.fromJS = function(data) {
    var self = this;

    this.groups([]);
    if (data.hasOwnProperty('entities')) {
        this.entities(jQuery.map(data.entities, function (entityJson) {
            var entity;
            switch (entityJson.type) {
                case 'StartBlock':
                    entity = new StartBlock(self);
                    entity.fromJS(entityJson);
                    break;
                case 'EndBlock':
                    entity = new EndBlock(self);
                    entity.fromJS(entityJson);
                    break;
                case 'QuestionnaireEditorData':
                    entity = new QuestionnaireEditorData(self);
                    entity.fromJS(entityJson);
                    break;
                case 'Connection':
                    entity = new Connection(self);
                    entity.fromJS(entityJson);
                    break;
                case 'Sequence':
                    entity = new Sequence(self);
                    entity.fromJS(entityJson);
                    break;
                case 'TextEditorData':
                    entity = new TextEditorData(self);
                    entity.fromJS(entityJson);
                    break;
                case 'FrameData':
                    entity = new FrameData(self);
                    entity.fromJS(entityJson);
                    break;
                case 'SubjectGroup':
                    entity = new SubjectGroup(self);
                    entity.fromJS(entityJson);
                    self.groups.push(entity);
                    break;
                case 'ExpSession':
                    entity = new ExpSession(self);
                    entity.fromJS(entityJson);
                    break;
                case 'ImageData':
                    entity = new ImageData(self);
                    entity.fromJS(entityJson);
                    break;
                case 'VideoData':
                    entity = new VideoData(self);
                    entity.fromJS(entityJson);
                    break;
                case 'ExpBlock':
                    entity = new ExpBlock(self);
                    entity.fromJS(entityJson);
                    self.expBlocks.push(entity);
                    break;
                case 'ExpTrialLoop':
                    entity = new ExpTrialLoop(self);
                    entity.fromJS(entityJson);
                    break;
                case 'GlobalVar':
                    entity = new GlobalVar(self);
                    entity.fromJS(entityJson);
                    self.globalVars.push(entity);
                    break;
                default:
                    console.error("type "+ entityJson.type + " is not defined in factory method.")
            }
            
            return entity;
        }));
    }

    return this;
};

ExpData.prototype.rebuildEntities = function() {
    // first empty the entities list:
    this.entities([]);

    this.reAddEntities();
};

ExpData.prototype.reAddEntities = function() {
    var self = this;

    // add the groups and their child nodes to entities:
    jQuery.each( this.groups(), function( index, elem ) {
        // check if they are not already in the list:
        if (!self.expData.entities.byId.hasOwnProperty(elem.id()))
            self.expData.entities.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        elem.reAddEntities();
    } );

    // add global variables to entities:
    jQuery.each( this.globalVars(), function( index, elem ) {
        // check if they are not already in the list:
        if (!self.expData.entities.byId.hasOwnProperty(elem.id()))
            self.expData.entities.push(elem);
    } );
};

ExpData.prototype.toJS = function() {
    // make sure that we have an up to date global list of all entities:
    this.rebuildEntities();

    // save to JSON:
    return {
        entities: jQuery.map( this.entities(), function( entity ) { return entity.toJS(); }),
        numGroups: this.groups().length
    };
};



ExpData.prototype.addNewSubjGroup = function() {
    var group = new SubjectGroup(this);
    var session = new ExpSession(this);
    group.addSession(session);
    this.addGroup(group);
};

ExpData.prototype.addNewBlock = function() {

    // define instance of block element
    var blockElements = [
        new StartBlock(this),
        new TextEditorData(this),
        new QuestionnaireEditorData(this),
        new ExpTrialLoop(this),
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

    this.expBlocks.push(block)

    this.reAddEntities();
};