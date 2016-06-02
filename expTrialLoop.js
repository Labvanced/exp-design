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
    this.name = ko.observable("TrialLoop");
    this.type = "ExpTrialLoop";
    this.subSequence = ko.observable(new Sequence(this.expData));
    this.subSequence().parent = this;

    // Variables
    this.trialUniqueIdVar = ko.observable(null);
    this.trialTypeIdVar = ko.observable(null);
    this.trialOrderVar = ko.observable(null);
    this.trialEmotionVar = ko.observable(null);
    this.factors = ko.observableArray([]);
    this.additionalTrialTypes =  ko.observableArray([]);
    this.eventVariables = ko.observableArray([]);

    //properties
    this.trialDesign = ko.observable("balanced");
    this.repsPerTrialType = ko.observable(1).extend({ numeric: 0 });
    this.minIntervalBetweenRep = ko.observable(0).extend({ numeric: 0 });
    this.isActive = ko.observable(false);
    this.randomization = ko.observable("reshuffle");
    this.webcamEnabled = ko.observable(false);

    // not serialized
    this.isInitialized = ko.observable(false);
    this.shape = "square";
    this.label = "Experiment";
    this.portTypes = ["executeIn", "executeOut"];


    this.nrTrialTypes = ko.computed(function() {
        if (this.isInitialized()){
            var nrTialT = 1;
            for (var i = 0; i<this.factors().length;i++ ){
                nrTialT*=this.factors()[i].levels().length;
            }
            for (var i = 0; i<this.additionalTrialTypes().length;i++ ){
                nrTialT+=this.additionalTrialTypes()[i].levels().length;
            }

            if  (this.factors().length>0 || this.additionalTrialTypes().length>0)    {
                 return nrTialT;
            }
            else{
                return nrTialT -1;
            }
        }
        else{
            return 0;
        }


    }, this);

    this.nrTrialTypesArray = ko.computed(function() {
        var array = [];
        for (var i = 0; i< this.nrTrialTypes();i++ ){
            array.push(i+1);
        }
        return array;

    }, this);

    this.trialTypesInteracting = ko.computed(function() {
        if (this.isInitialized()){
            var trialTypes = [];
            var trialTypesString = [];
            var factors = this.factors();
            for (var i = 0; i<factors.length;i++ ){
                var levels = factors[i].levels();
                if (trialTypes.length == 0) {
                    // special case, because this is the first interacting factor. Therefore just add all levels:
                    // add all levels of this new non-interacting factor:
                    for (var l=0; l<levels.length; l++){
                        // add this level of the non-interacting factor:
                        trialTypes.push([l]); // so far only one factor --> array of length 1
                        trialTypesString.push([levels[l].name]);
                    }
                }
                else {
                    // create new array of new interacting trialTypes with all combinations:
                    var oldTrialTypes = trialTypes;
                    var oldTrialTypesString = trialTypesString;
                    trialTypes = [];
                    trialTypesString = [];
                    for (var t=0; t<oldTrialTypes.length; t++){
                        // add all levels of this new interacting factor:
                        for (var l=0; l<levels.length; l++) {
                            // mix previous trialType t with level l of the newly interacting factor:
                            var newTrialType = oldTrialTypes[t].slice(); // deep copy array
                            newTrialType.push(l);
                            trialTypes.push(newTrialType);

                            var newTrialTypeString = oldTrialTypesString[t].slice(); // deep copy array
                            newTrialTypeString.push(levels[l].name);
                            trialTypesString.push(newTrialTypeString);
                        }
                    }
                }
            }

            return {
                idx: trialTypes,
                str: trialTypesString
            };
        }
        else{
            return {
                idx: [],
                str: []
            };
        }
    }, this);

    this.trialTypesNonInteract = ko.computed(function() {
        if (this.isInitialized()){
            var trialTypes = [];
            var trialTypesString = [];
            var additionalTrialTypes = this.additionalTrialTypes();
            for (var i = 0; i<additionalTrialTypes.length;i++ ){
                var levels = additionalTrialTypes[i].levels();
                // add all levels of this non interacting factor:
                for (var l=0; l<levels.length; l++) {
                    trialTypes.push([i, l]);
                    trialTypesString.push([additionalTrialTypes[i], levels[l]]);
                }
            }
            return {
                idx: trialTypes,
                str: trialTypesString
            };
        }
        else{
            return {
                idx: [],
                str: []
            };
        }
    }, this);


    this.trialSpecifications = ko.computed(function() {

        var trialSpecifications = [];

        var trialTypesInteracting = this.trialTypesInteracting();
        for (var i=0; i<trialTypesInteracting.idx.length; i++){
            var currentTrialSelection = {
                type: 'interacting',
                trialTypesInteractingIdx: i,
                factors: jQuery.map(this.factors(),
                    function(elem, idx){
                        return elem.id();
                    }
                ),
                levels: trialTypesInteracting.idx[i]
            };
            trialSpecifications.push(currentTrialSelection);
        }

        var trialTypesNonInteract = this.trialTypesNonInteract();
        for (var i=0; i<trialTypesNonInteract.idx.length; i++){

            var curr_factor = trialTypesNonInteract.idx[i][0];
            var curr_level = trialTypesNonInteract.idx[i][1];

            var currentTrialSelection = {
                type: 'noninteract',
                factor: this.additionalTrialTypes()[curr_factor].id(),
                level: curr_level
            };
            trialSpecifications.push(currentTrialSelection);
        }

        return trialSpecifications;

    }, this);


    this.totalNrTrials = ko.computed(function() {
        return  this.nrTrialTypes() * this.repsPerTrialType();
    }, this);


    this.vars = ko.computed(function() {
        var array = [];
        array.push(this.trialUniqueIdVar());
        array.push(this.trialTypeIdVar());
        array.push(this.trialOrderVar());
        if(this.webcamEnabled()){
            array.push(this.trialEmotionVar());
        }
        var list1 = this.factors();
        var list2 = this.additionalTrialTypes();
        var list3 = this.eventVariables();
        for (var i = 0; i< list1.length;i++ ){
            array.push(list1[i]);
        }
        for (var i = 0; i< list2.length;i++ ){
            array.push(list2[i]);
        }
        for (var i = 0; i< list3.length;i++ ){
            array.push(list3[i]);
        }
        return array;

    }, this);



    this.trialDesign.subscribe(function(newVal){
        if (newVal== "unbalanced"){
            $("#repPerTrialType").hide();
            $("#repPerTrialTypeUnbal").show();
        }
        else{
            $("#repPerTrialType").show();
            $("#repPerTrialTypeUnbal").hide();
        }
    });

    this.portHandler = new PortHandler(this);

};


ExpTrialLoop.prototype.addNewFrame = function() {
    var frame = new FrameData(this.expData);
    this.subSequence().addNewSubElement(frame);
    frame.parent = this.subSequence();
};

ExpTrialLoop.prototype.setPointers = function(entitiesArr) {
    var self = this;

    // convert id of subSequence to actual pointer:
    this.subSequence(entitiesArr.byId[this.subSequence()]);
    this.subSequence().parent = this;

    this.trialUniqueIdVar(entitiesArr.byId[this.trialUniqueIdVar()]);
    this.trialTypeIdVar(entitiesArr.byId[this.trialTypeIdVar()]);
    this.trialOrderVar(entitiesArr.byId[this.trialOrderVar()]);

    if (this.trialEmotionVar()) {
        this.trialEmotionVar(entitiesArr.byId[this.trialEmotionVar()]);
    }
    else {
        var trialEmotionVar = new GlobalVar(this.expData);
        trialEmotionVar.subtype(GlobalVar.subtypes[8]);
        trialEmotionVar.dataType(GlobalVar.dataTypes[2]);
        trialEmotionVar.scope(GlobalVar.scopes[6]);
        trialEmotionVar.scale(GlobalVar.scales[4]);
        trialEmotionVar.name("Emotion");
        this.trialEmotionVar(trialEmotionVar);
    }

    // convert ids to actual pointers:
    this.factors(jQuery.map( this.factors(), function( id ) {
        return entitiesArr.byId[id];
    } ));
    this.additionalTrialTypes(jQuery.map( this.additionalTrialTypes(), function( id ) {
        return entitiesArr.byId[id];
    } ));
    this.eventVariables(jQuery.map( this.eventVariables(), function( id ) {
        return entitiesArr.byId[id];
    } ));
    this.isInitialized(true);
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

    if (!entitiesArr.byId.hasOwnProperty(this.trialEmotionVar().id())) {
        entitiesArr.push(this.trialEmotionVar());
    }

    jQuery.each(this.factors(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id())) {
            entitiesArr.push(elem);
        }
    });
    jQuery.each(this.additionalTrialTypes(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id())) {
            entitiesArr.push(elem);
        }
    });
    jQuery.each(this.eventVariables(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id())) {
            entitiesArr.push(elem);
        }
    });


    // recursively make sure that all deep tree nodes are in the entities list:
    this.subSequence().reAddEntities(entitiesArr);
};




ExpTrialLoop.prototype.addFactor = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[3]);
    globalVar.dataType(GlobalVar.dataTypes[2]);
    globalVar.scope(GlobalVar.scopes[6]);
    globalVar.scale(GlobalVar.scales[2]);
    globalVar.name("factor_" + (this.factors().length+1));

    globalVar.isFactor(true);
    globalVar.isInteracting(true);
    globalVar.addLevel();
    this.factors.push(globalVar);
    return globalVar;
};

ExpTrialLoop.prototype.renameFactor = function(idx,flag) {

    if (flag == "true"){
        this.factors()[idx].editName(true);
    }
    else if (flag == "false"){
        this.factors()[idx].editName(false);
    }
};


ExpTrialLoop.prototype.removeFactor = function(idx) {
    this.factors.splice(idx,1);
};



ExpTrialLoop.prototype.addSepTrialType= function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[3]);
    globalVar.dataType(GlobalVar.dataTypes[2]);
    globalVar.scope(GlobalVar.scopes[6]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name("nonint_factor_" + (this.additionalTrialTypes().length+1));

    globalVar.isFactor(true);
    globalVar.addLevel();
    this.additionalTrialTypes.push(globalVar);
};


ExpTrialLoop.prototype.renameAddTrialType = function(idx,flag) {

    if (flag == "true"){
        this.additionalTrialTypes()[idx].editName(true);
    }
    else if (flag == "false"){
        this.additionalTrialTypes()[idx].editName(false);
    }
};


ExpTrialLoop.prototype.removeAddTrialType = function(idx) {
    this.additionalTrialTypes.splice(idx,1);
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
    this.id(data.id);
    this.name(data.name);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    this.type =  data.type;
    this.subSequence(data.subSequence);

    this.trialDesign(data.trialDesign);
    this.repsPerTrialType(data.repsPerTrialType);
    this.isActive(data.isActive);
    this.randomization(data.randomization);
    this.minIntervalBetweenRep(data.minIntervalBetweenRep);
    this.webcamEnabled(data.webcamEnabled);

    this.trialUniqueIdVar(data.trialUniqueIdVar);
    this.trialTypeIdVar(data.trialTypeIdVar);
    this.trialOrderVar(data.trialOrderVar);
    if (data.hasOwnProperty('trialEmotionVar')){
        this.trialEmotionVar(data.trialEmotionVar);
    }
    this.factors(data.factors);
    this.additionalTrialTypes(data.additionalTrialTypes);
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
        type: this.type,
        subSequence: this.subSequence().id(),

        trialDesign:  this.trialDesign(),
        repsPerTrialType:  this.repsPerTrialType(),
        isActive:  this.isActive(),
        randomization:  this.randomization(),
        minIntervalBetweenRep: this.minIntervalBetweenRep(),
        webcamEnabled: this.webcamEnabled(),

        trialUniqueIdVar: this.trialUniqueIdVar().id(),
        trialTypeIdVar: this.trialTypeIdVar().id(),
        trialOrderVar: this.trialOrderVar().id(),
        trialEmotionVar: this.trialEmotionVar().id(),
        factors: jQuery.map( this.factors(), function( factor ) { return factor.id(); } ),
        additionalTrialTypes: jQuery.map( this.additionalTrialTypes(), function( addtrialtypes ) { return addtrialtypes.id(); }),
        eventVariables: jQuery.map( this.eventVariables(), function( eventVariables ) { return eventVariables.id(); })
    }
};
    