// � by Caspar Goeke and Holger Finger

var ExpTrialLoop = function (expData) {
    this.expData = expData;
    this.parent = null;

    // serialized:
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.id = ko.observable(guid());
    this.name = ko.observable("TrialLoop");
    this.type = "ExpTrialLoop";
    this.subSequence = ko.observable(new Sequence(expData));

    this.factors = ko.observableArray([]);
    this.additionalTrialTypes =  ko.observableArray([]);
    this.trialDesign = ko.observable("balanced");
    this.repsPerTrialType = ko.observable(0);
    this.isActive = ko.observable(false);
    this.randomization = ko.observable("reshuffle");

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
                    // mix previous trialType t with level l of the newly interacting factor:
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

    this.totalNrTrials = ko.computed(function() {
        return  this.nrTrialTypes() * this.repsPerTrialType();
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




ExpTrialLoop.prototype.setPointers = function() {
    var self = this;

    // convert id of subSequence to actual pointer:
    this.subSequence(self.expData.entities.byId[this.subSequence()]);
    this.subSequence().parent = this;

    // convert ids to actual pointers:
    this.factors(jQuery.map( this.factors(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
    this.additionalTrialTypes(jQuery.map( this.additionalTrialTypes(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
    this.isInitialized(true);
};

ExpTrialLoop.prototype.doubleClick = function() {
    // this trial loop was double clicked in the editor:
    uc.currentEditorData = this.subSequence();
    if (uc.currentEditorView instanceof ExperimentEditor){
        uc.currentEditorView.setDataModel(this.subSequence());
    }
    else {
        page("/page/editors/experimenteditor/"+uc.experiment.exp_id()+"/"+this.subSequence().id());
    }
};

ExpTrialLoop.prototype.addFactor = function() {

    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[1].text);
    globalVar.dataType("numeric");
    var name = "factor_" + (this.factors().length+1);
    globalVar.name(name);
    globalVar.assigned(true);
    globalVar.addLevel();
    this.expData.addGlobalVar(globalVar);
    this.factors.push(globalVar);
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
    globalVar.subtype(GlobalVar.subtypes[6].text);
    globalVar.dataType("numeric");
    var name = "noninteracting_factor_" + (this.additionalTrialTypes().length+1);
    globalVar.name(name);
    globalVar.assigned(true);
    globalVar.addLevel();
    this.expData.addGlobalVar(globalVar);
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


ExpTrialLoop.prototype.reAddEntities = function() {
    var self = this;

    // add the direct child nodes:
    // check if they are not already in the list:
    if (!self.expData.entities.byId.hasOwnProperty(this.subSequence().id()))
        self.expData.entities.push(this.subSequence());

    // recursively make sure that all deep tree nodes are in the entities list:
    this.subSequence().reAddEntities();
};

ExpTrialLoop.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.subSequence(data.subSequence);
    this.type =  data.type;

    this.factors(data.factors);
    this.additionalTrialTypes(data.additionalTrialTypes);
    this.trialDesign(data.trialDesign);
    this.repsPerTrialType(data.repsPerTrialType);
    this.isActive(data.isActive);
    this.randomization(data.randomization);
    return this;

};


ExpTrialLoop.prototype.toJS = function() {
    return {
        id: this.id(),
        name: this.name(),
        portHandler:this.portHandler.toJS(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        type: this.type,
        subSequence: this.subSequence().id(),
        trialDesign:  this.trialDesign(),
        repsPerTrialType:  this.repsPerTrialType(),
        isActive:  this.isActive(),
        randomization:  this.randomization(),
        factors: jQuery.map( this.factors(), function( factor ) { return factor.id(); } ),
        additionalTrialTypes: jQuery.map( this.additionalTrialTypes(), function( addtrialtypes ) { return addtrialtypes.id(); } )
    };
};
