// � by Caspar Goeke and Holger Finger

/**
 * This class stores all informations of a task. Most importantly, it has one or more sequences of frames and pages.
 * It stores the factorGroups and per factorGroup one subSequence.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
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
    this.name = ko.observable("New Task");
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
    this.selectionSpec = ko.observable(null);

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
    this.addFactorGroup();
    this.addNewFrame();
 //   var subsequence = new Sequence(this.expData);
 //   this.subSequence(subsequence);
 //   this.subSequencePerFactorGroup([subsequence]);
 //   subsequence.parent = this;
 //   subsequence.setFactorGroup(this.factorGroups()[0]);
};

ExpTrialLoop.prototype.addNewFrame = function() {
    var frame = new FrameData(this.expData);
    this.subSequence().addNewSubElement(frame);
    frame.parent = this.subSequence();
};

ExpTrialLoop.prototype.addFactorGroup = function() {
    var factorGroup = new FactorGroup(this.expData);
    factorGroup.name("trial_group_" + (this.factorGroups().length+1));
    this.factorGroups.push(factorGroup);

    // add a new subSequence for the new group (if there are not already enough subSequences):
    if (this.subSequencePerFactorGroup().length < this.factorGroups().length) {
        var subsequence = new Sequence(this.expData);
        subsequence.parent = this;
        subsequence.setFactorGroup(factorGroup);
        this.subSequence(subsequence);
        this.subSequencePerFactorGroup().push(subsequence);
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

/**
 * Select a specific or multiple trial types.
 *
 * @param {object} selectionSpec - the specification of the trials that are selected:
 * 4 types possible:
 * { type: 'allTrials', factorGroup: facGroup_obj }
 * { type: 'factorLevel', factor: factor_obj, level: level_obj}
 * { type: 'condition', condition: condition_obj }
 * { type: 'trialVariation', trialVariation: trialVariation_obj }
 */
ExpTrialLoop.prototype.selectTrialType = function(selectionSpec) {

    // add some meta data to the specification to make later calculations easier:
    if (selectionSpec.type == 'factorLevel') {
        selectionSpec.factorGroup = selectionSpec.factor.factorGroup;

        // add level index for later use:
        selectionSpec.levelIdx = selectionSpec.factor.globalVar().levels().indexOf(selectionSpec.level);
    }
    if (selectionSpec.type == 'condition' || selectionSpec.type == 'trialVariation') {
        if (selectionSpec.type == 'trialVariation') {
            selectionSpec.condition = selectionSpec.trialVariation.condition;
        }

        selectionSpec.factorGroup = selectionSpec.condition.factorGroup;

        // add the selected factors and levels and level indices for later use...
        selectionSpec.allFactors = selectionSpec.factorGroup.factors();
        selectionSpec.allLevels = selectionSpec.condition.factorLevels();
        selectionSpec.allLevelIdx = [];
        for (var i = 0; i < selectionSpec.allLevels.length; i++) {
            var levelIdx = selectionSpec.allFactors[i].globalVar().levels().indexOf(selectionSpec.allLevels[i]);
            selectionSpec.allLevelIdx.push(levelIdx);
        }
    }

    var factorGroupIdx = this.factorGroups().indexOf( selectionSpec.factorGroup );
    var selectedSubSequence = this.subSequencePerFactorGroup()[factorGroupIdx];
    if (selectedSubSequence != this.subSequence()) {
        this.subSequence(selectedSubSequence);
    }
    this.subSequence().selectTrialType(selectionSpec);
    this.selectionSpec(selectionSpec);
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpTrialLoop.prototype.setPointers = function(entitiesArr) {
    var self = this;

    var factorGroups = this.factorGroups();
    var subSequences = this.subSequencePerFactorGroup();

    var subSequencesObj = [];
    for (var i=0; i<subSequences.length; i++) {
        var subSequence = entitiesArr.byId[subSequences[i]];
        subSequence.parent = self;
        subSequence.setFactorGroup(factorGroups[i]);
        subSequencesObj.push(subSequence);
    }
    this.subSequencePerFactorGroup(subSequencesObj);
    this.subSequence(subSequencesObj[0]);

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

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpTrialLoop.prototype.reAddEntities = function(entitiesArr) {
    // add the direct child nodes:
    // check if they are not already in the list:

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

    jQuery.each(this.factorGroups(), function( index, factorGroup ) {
        factorGroup.reAddEntities(entitiesArr);
    });

    // recursively make sure that all deep tree nodes are in the entities list:
    jQuery.each(this.subSequencePerFactorGroup(), function( index, subSequence ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(subSequence.id())) {
            entitiesArr.push(subSequence);
        }
        subSequence.reAddEntities(entitiesArr);
    });

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ExpTrialLoop}
 */
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
            return (new FactorGroup(self.expData)).fromJS(factorGroup);
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

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
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
    };
};