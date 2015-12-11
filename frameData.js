// � by Caspar Goeke and Holger Finger


var FrameData = function(expData) {
    
    var self = this;
    this.expData = expData;
    this.currSelectedElement = ko.observable();
    this.parent = null;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.id = ko.observable(guid());
    this.type = "FrameData";
    this.name = ko.observable("MediaFrame");
    this.onset = ko.observable(0);
    this.onsetEnabled = ko.observable(false);
    this.offset = ko.observable(0);
    this.offsetEnabled = ko.observable(false);

    // not serialized
    this.shape = "square";
    this.label = "MediaFrame";
    this.portTypes = ["executeIn", "executeOut"];
    this.trialTypeView = {

    };

    // sub-Structures (serialized below)
    this.elements = ko.observableArray([]).extend({sortById: null});
    this.portHandler = new PortHandler(this);
    this.responses = ko.observableArray([]);

};

FrameData.prototype.addNewResponse = function(responseType) {
    var resp = new Response(this);
    resp.responseType(responseType);
    this.responses.push(resp);
};

FrameData.prototype.addNewSubElement = function(elem) {
    this.elements.push(elem);
    this.expData.entities.push(elem);
    elem.parent = this;
};

FrameData.prototype.doubleClick = function() {
    // this frame was double clicked in the parent Experiment editor:
    uc.currentEditorData = this;
    if (uc.currentEditorView instanceof MediaEditor){
        uc.currentEditorView.setDataModel(this);
    }
    else {
        page("/page/editors/mediaEditor/"+uc.experiment.exp_id()+"/"+this.id());
    }

};

FrameData.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        var elem = self.expData.entities.byId[id];
        elem.parent = self;
        return elem;
    } ));
};

FrameData.prototype.getElementById = function(id) {
    return  this.elements.byId[id];
};


FrameData.prototype.reAddEntities = function() {
    var self = this;

    // add the direct child nodes:
    jQuery.each( this.elements(), function( index, elem ) {
        // check if they are not already in the list:
        if (!self.expData.entities.byId.hasOwnProperty(elem.id()))
            self.expData.entities.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities();
    } );

};

FrameData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.onset(data.onset);
    this.onsetEnabled(data.onsetEnabled);
    this.offset(data.offset);
    this.offsetEnabled(data.offsetEnabled);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.responses(jQuery.map( data.responses, function( respData ) {
        return (new Response()).fromJS(respData);
    } ));
    this.elements(data.elements);
    return this;
};

FrameData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name:  this.name(),
        onset: this.onset(),
        onsetEnabled: this.onsetEnabled(),
        offset: this.offset(),
        offsetEnabled: this.offsetEnabled(),
        portHandler: this.portHandler.toJS(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        responses: jQuery.map( this.responses(), function( resp ) { return resp.toJS(); } ),
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};


