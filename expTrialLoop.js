// � by Caspar Goeke and Holger Finger

var ExpTrialLoop = function (expData) {
    this.expData = expData;
    this.parent = null;

    // serialized:
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.editorWidth = ko.observable(120);
    this.editorHeight = ko.observable(60);
    this.id = ko.observable(guid());
    this.displayInitialCountdown = ko.observable(true);
    this.name = ko.observable("TrialLoop");
    this.type = "ExpTrialLoop";
    this.subSequence = ko.observable(null);
    this.subSequencePerFactorGroup = ko.observableArray([]);

    // Variables that are recorded per trial:
    this.trialUniqueIdVar = ko.observable(null);
    this.trialTypeIdVar = ko.observable(null);
    this.trialOrderVar = ko.observable(null);

    this.factorGroups = ko.observableArray([]);
    this.eventVariables = ko.observableArray([]);

    //properties
    this.trialsPerSub = ko.observable(0);
    this.betweenSubjectDesign = ko.observable(false);

    this.repsPerTrialType = ko.observable(1).extend({ numeric: 0 });
    this.minIntervalBetweenRep = ko.observable(0).extend({ numeric: 0 });
    this.isActive = ko.observable(false);
    this.randomization = ko.observable("reshuffle");


    // not serialized
    this.isInitialized = ko.observable(false);
    this.shape = "square";
    this.label = "Experiment";
    this.portTypes = ["executeIn", "executeOut"];

    this.totalNrTrials = ko.computed(function() {

        return 5; // TODo
    }, this);


    this.vars = ko.computed(function() {
        var array = [];
        array.push(this.trialUniqueIdVar());
        array.push(this.trialTypeIdVar());
        array.push(this.trialOrderVar());
        var eventList = this.eventVariables();

        for (var i = 0; i< eventList.length;i++ ){
            array.push(eventList[i]);
        }
        return array;

    }, this);

    this.portHandler = new PortHandler(this);

    var self = this;

    this.betweenSubjectDesign.subscribe(function(newVal) {
        if (newVal == true) {
            self.trialsPerSub(self.totalNrTrials())
        }
    })

};

/**
 * Is called to initialize a newly created exp trial loop (instead of initialization via loadJS)
 */
ExpTrialLoop.prototype.initNewInstance = function() {
    var subsequence = new Sequence(this.expData);
    this.subSequence(subsequence);
    this.subSequencePerFactorGroup([subsequence]);
    subsequence.parent = this;

};

ExpTrialLoop.prototype.setPointers = function(entitiesArr) {
    var self = this;

    this.subSequencePerFactorGroup(jQuery.map(this.subSequencePerFactorGroup(), function (subSequenceId) {
        var subSequence = entitiesArr.byId[subSequenceId];
        subSequence.parent = self;
        return subSequence;
    }));
    this.subSequence(this.subSequencePerFactorGroup()[0]);

    this.trialUniqueIdVar(entitiesArr.byId[this.trialUniqueIdVar()]);
    this.trialTypeIdVar(entitiesArr.byId[this.trialTypeIdVar()]);
    this.trialOrderVar(entitiesArr.byId[this.trialOrderVar()]);

    this.eventVariables(jQuery.map( this.eventVariables(), function( id ) {
        return entitiesArr.byId[id];
    } ));
    this.isInitialized(true);

    jQuery.each( this.factorGroups(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );

};

ExpTrialLoop.prototype.addFactorGroup = function() {
    var facGroup = new FactorGroup(this.expData,this);
    this.factorGroups.push(facGroup);

    // add a new subSequence for the new group (if there are not already enough subSequences):
    if (this.subSequencePerFactorGroup().length < this.factorGroups().length) {
        this.subSequencePerFactorGroup().push(new Sequence(this.expData));
    }
};

ExpTrialLoop.prototype.renameGroup = function(facGroupIdx,flag) {

    if (flag == "true"){
        this.factorGroups()[facGroupIdx].editName(true);
    }
    else if (flag == "false"){
        this.factorGroups()[facGroupIdx].editName(false);
    }
};

ExpTrialLoop.prototype.removeGroup = function(facGroupIdx,idx) {
    this.factorGroups.splice(facGroupIdx,1);
    this.subSequencePerFactorGroup().splice(facGroupIdx,1);
};


ExpTrialLoop.prototype.addNewFrame = function() {
    var frame = new FrameData(this.expData);
    this.subSequence().addNewSubElement(frame);
    frame.parent = this.subSequence();
};

ExpTrialLoop.prototype.reAddEntities = function(entitiesArr) {
    var self = this;

    // add the direct child nodes:
    // check if they are not already in the list:
    if (!entitiesArr.byId.hasOwnProperty(this.subSequence().id())) {
        entitiesArr.push(this.subSequence());
    }

    if (!entitiesArr.byId.hasOwnProperty(this.trialUniqueIdVar().id())) {
        entitiesArr.push(this.trialUniqueIdVar());
    }

    if (!entitiesArr.byId.hasOwnProperty(this.trialTypeIdVar().id())) {
        entitiesArr.push(this.trialTypeIdVar());
    }

    if (!entitiesArr.byId.hasOwnProperty(this.trialOrderVar().id())) {
        entitiesArr.push(this.trialOrderVar());
    }

    jQuery.each(this.eventVariables(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id())) {
            entitiesArr.push(elem);
        }
    });


    // recursively make sure that all deep tree nodes are in the entities list:
    this.subSequence().reAddEntities(entitiesArr);
};

ExpTrialLoop.prototype.doubleClick = function() {
    // this trial loop was double clicked in the editor:
    uc.currentEditorData = this.subSequence();
    if (uc.currentEditorView instanceof TrialEditor){
        uc.currentEditorView.setDataModel(this.subSequence());
    }
    else {
        page("/page/editors/trialEditor/"+uc.experiment.exp_id()+"/"+this.subSequence().id());
    }
};


ExpTrialLoop.prototype.fromJS = function(data) {
    var self = this;

    this.id(data.id);
    this.name(data.name);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    if (data.hasOwnProperty('displayInitialCountdown')) {
        this.displayInitialCountdown(data.displayInitialCountdown);
    }
    this.type =  data.type;

    if (data.hasOwnProperty('subSequence')){
        // convert from old version:
        this.subSequencePerFactorGroup([data.subSequence]);
    }
    else {
        // new version:
        this.factorGroups(jQuery.map(data.factorGroups, function (factorGroup) {
            return (new FactorGroup(self.expData, self)).fromJS(factorGroup);
        }));
        this.subSequencePerFactorGroup(data.subSequencePerFactorGroup);
    }

    this.repsPerTrialType(data.repsPerTrialType);
    this.isActive(data.isActive);
    this.randomization(data.randomization);
    this.minIntervalBetweenRep(data.minIntervalBetweenRep);

    this.trialUniqueIdVar(data.trialUniqueIdVar);
    this.trialTypeIdVar(data.trialTypeIdVar);
    this.trialOrderVar(data.trialOrderVar);

    this.eventVariables(data.eventVariables);

    return this;

};


ExpTrialLoop.prototype.toJS = function() {
    return {
        id: this.id(),
        name: this.name(),
        portHandler:this.portHandler.toJS(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        editorWidth: this.editorWidth(),
        editorHeight: this.editorHeight(),
        displayInitialCountdown: this.displayInitialCountdown(),
        type: this.type,
        factorGroups: jQuery.map( this.factorGroups(), function( factorGroup ) { return factorGroup.toJS(); }),
        subSequencePerFactorGroup: jQuery.map( this.subSequencePerFactorGroup(), function( subSequence ) { return subSequence.id(); }),

        repsPerTrialType:  this.repsPerTrialType(),
        isActive:  this.isActive(),
        randomization:  this.randomization(),
        minIntervalBetweenRep: this.minIntervalBetweenRep(),

        trialUniqueIdVar: this.trialUniqueIdVar().id(),
        trialTypeIdVar: this.trialTypeIdVar().id(),
        trialOrderVar: this.trialOrderVar().id(),

        eventVariables: jQuery.map( this.eventVariables(), function( eventVariables ) { return eventVariables.id(); })
    }
};