// � by Caspar Goeke and Holger Finger

var ExpData = function () {
    this.expData = this; // self reference for consistency with other classes..
    this.entities = ko.observableArray([]).extend({sortById: null});
    this.groups = ko.observableArray([]).extend({sortById: null});
    this.expBlocks = ko.observableArray([]).extend({sortById: null});


    this.expName =  ko.observable();
    this.subjectId =  ko.observable();
    this.groupId =  ko.observable();
    this.timeStamp =  ko.observable();
    this.sessionNr =  ko.observable();

    this.vars = ko.computed(function() {
        if (this.hasOwnProperty("expName")){
            return [this.expName(), this.subjectId(), this.groupId(),this.timeStamp(), this.sessionNr()];
        }
        else{
            return [];
        }
    }, this);


};


ExpData.prototype.setPointers = function() {
    var self = this;
    var allEntitiesArray = this.entities();
    jQuery.each( allEntitiesArray, function( index, elem ) {
        elem.setPointers(self.entities);
    } );
    this.expName(this.entities.byId[this.expName()]);
    this.subjectId(this.entities.byId[this.subjectId()]);
    this.groupId(this.entities.byId[this.groupId()]);
    this.timeStamp(this.entities.byId[this.timeStamp()]);
    this.sessionNr(this.entities.byId[this.sessionNr()]);
};

ExpData.prototype.setVars = function() {

    this.expName(new GlobalVar(this.expData));
    this.expName().subtype(GlobalVar.subtypes[1]);
    this.expName().dataType(GlobalVar.dataTypes[1]);
    this.expName().scope(GlobalVar.scopes[1]);
    this.expName().scale(GlobalVar.scales[1]);
    this.expName().name('Experiment Id');

    this.subjectId(new GlobalVar(this.expData));
    this.subjectId().subtype(GlobalVar.subtypes[1]);
    this.subjectId().dataType(GlobalVar.dataTypes[1]);
    this.subjectId().scope(GlobalVar.scopes[1]);
    this.subjectId().scale(GlobalVar.scales[1]);
    this.subjectId().name('Subject Id');

    this.groupId(new GlobalVar(this.expData));
    this.groupId().subtype(GlobalVar.subtypes[1]);
    this.groupId().dataType(GlobalVar.dataTypes[1]);
    this.groupId().scope(GlobalVar.scopes[1]);
    this.groupId().scale(GlobalVar.scales[1]);
    this.groupId().name('Group Id');

    this.timeStamp(new GlobalVar(this.expData));
    this.timeStamp().subtype(GlobalVar.subtypes[1]);
    this.timeStamp().dataType(GlobalVar.dataTypes[1]);
    this.timeStamp().scope(GlobalVar.scopes[2]);
    this.timeStamp().scale(GlobalVar.scales[1]);
    this.timeStamp().name('Time Stamp');

    this.sessionNr(new GlobalVar(this.expData));
    this.sessionNr().subtype(GlobalVar.subtypes[1]);
    this.sessionNr().dataType(GlobalVar.dataTypes[2]);
    this.sessionNr().scope(GlobalVar.scopes[2]);
    this.sessionNr().scale(GlobalVar.scales[1]);
    this.sessionNr().name('Session Number');

};


ExpData.prototype.addGroup = function(group) {
    return this.groups.push(group);
};

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
    this.expName(data.expName);
    this.subjectId(data.subjectId);
    this.groupId(data.groupId);
    this.timeStamp(data.timeStamp);
    this.sessionNr(data.sessionNr);

    return this;
};

ExpData.prototype.rebuildEntities = function() {
    // first empty the entities list:
    this.entities([]);

    this.reAddEntities();
};

ExpData.prototype.reAddEntities = function() {
    var self = this;

    var entitiesArr = this.entities;

    // add the groups and their child nodes to entities:
    jQuery.each( this.groups(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        elem.reAddEntities(entitiesArr);
    } );

    if (!entitiesArr.byId.hasOwnProperty(this.expName().id())) {
        entitiesArr.push(this.expName());
    }
    if (!entitiesArr.byId.hasOwnProperty(this.subjectId().id())) {
        entitiesArr.push(this.subjectId());
    }
    if (!entitiesArr.byId.hasOwnProperty(this.groupId().id())) {
        entitiesArr.push(this.groupId());
    }
    if (!entitiesArr.byId.hasOwnProperty(this.timeStamp().id())) {
        entitiesArr.push(this.timeStamp());
    }
    if (!entitiesArr.byId.hasOwnProperty(this.sessionNr().id())) {
        entitiesArr.push(this.sessionNr());
    }

};

ExpData.prototype.toJS = function() {
    // make sure that we have an up to date global list of all entities:
    this.rebuildEntities();



    // save to JSON:
    return {
        entities: jQuery.map( this.entities(), function( entity ) { return entity.toJS(); }),
        numGroups: this.groups().length,
        expName: this.expName().id(),
        subjectId: this.subjectId().id(),
        groupId: this.groupId().id(),
        sessionNr: this.sessionNr().id(),
        timeStamp: this.timeStamp().id()
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

            if (blockNames[i] == 'Trial-Loop'){
                // trial randomization, premade variable per exp trial loop
                var trialOrder = new GlobalVar(this.expData);
                trialOrder.subtype(GlobalVar.subtypes[2]);
                trialOrder.dataType(GlobalVar.dataTypes[2]);
                trialOrder.scope(GlobalVar.scopes[5]);
                trialOrder.scale(GlobalVar.scales[2]);
                trialOrder.name("trial_randomization");
                blockElements[i].trialOrderVar(trialOrder);
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