// ? by Caspar Goeke and Holger Finger


var TrialData = function(expData) {

    this.expData = expData;

    this.id = ko.observable(guid());
    this.type = "TrialData";
    this.name = ko.observable("Trial");
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);

    this.shape = "square";
    this.label = "Trial";

    this.frameData = ko.observable(new FrameData(this.expData, this));
    this.slideData = ko.observable(new Sequence(this.expData, this));

};



TrialData.prototype.addNewSubElement = function(elem) {
    this.elements.push(elem);
    this.expData.entities.push(elem);
    elem.parent = this;
};

TrialData.prototype.doubleClick = function() {
    // this frame was double clicked in the parent Experiment editor:
    uc.currentEditorData = this;
    if (uc.currentEditorView instanceof TrialEditor){
        uc.currentEditorView.setDataModel(this);
    }
    else {
        page("/page/editors/trialEditor/"+uc.experiment.exp_id()+"/"+this.id());
    }

};

TrialData.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        var elem = self.expData.entities.byId[id];
        elem.parent = self;
        return elem;
    } ));
};

TrialData.prototype.getElementById = function(id) {
    return  this.elements.byId[id];
};



TrialData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
};

TrialData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name:  this.name()
    };
};


