// � by Caspar Goeke and Holger Finger

var ExpTrialLoop = function (expData) {
    this.expData = expData;

    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.id = ko.observable(guid());
    this.name = ko.observable("TrialLoop");
    this.type = "ExpTrialLoop";
    this.subSequence = ko.observable(new Sequence(expData));
    this.factors = ko.observableArray([]);
    this.trialDesign = ko.observable("balanced");
    this.repsPerTrialType = ko.observable(0);
    this.isActive = ko.observable(false);
    this.randomization = ko.observable("undefined");

    // not serialized
    this.shape = "square";
    this.label = "Experiment";
    this.portTypes = ["executeIn", "executeOut"];

    this.nrTrialTypes = ko.computed(function() {
        var nrTialT = 1;
        for (var i = 0; i<this.factors().length;i++ ){
            nrTialT*=this.factors()[i].levels().length
        }
        if  (this.factors().length>0)    {
             return nrTialT;
        }
        else{
            return nrTialT -1;
        }
    }, this);

    this.nrTrialTypesArray = ko.computed(function() {
        var array = [];
        for (var i = 0; i< this.nrTrialTypes();i++ ){
            array.push(i+1);
        }
        return array;

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
    $("#repPerTrialTypeUnbal").hide();
    // convert id of subSequence to actual pointer:
    return this.subSequence(self.expData.entities.byId[this.subSequence()]);
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
    globalVar.name("factor_1");
    globalVar.assigned(true);
    var level = {
        name:"level_1"
    };
    globalVar.levels.push(level);
    this.expData.addGlobalVar(globalVar);
    this.factors.push(globalVar);
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
        subSequence: this.subSequence().id()
    };

};
