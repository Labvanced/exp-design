// � by Caspar Goeke and Holger Finger


var MediaEditorData = function(expData) {
    
    var self = this;
    this.expData = expData;

    // serialized
    this.id = ko.observable(guid());
    this.type = "MediaEditorData";
    this.currSelectedElement = ko.observable(null);
    this.name = ko.observable("Media Editor");
    this.maxPresentationTime = ko.observable(null);

    // not serialized
    this.shape = "square";
    this.label = "MediaEditor";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observableArray([]).extend({sortById: null});
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);
    this.responses = ko.observableArray([]);

};

MediaEditorData.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.mediaEditorData = this;
    page("/page/editors/mediaEditor");
};

MediaEditorData.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
};

MediaEditorData.prototype.getElementById = function(id) {
    return  this.elements.byId[id];
};

MediaEditorData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.minPresentationTime(data.minPresentationTime);
    this.maxPresentationTime(data.maxPresentationTime);
    this.portHandler.fromJS(data.portHandler);
    this.canvasElement.fromJS(data.canvasElement);
    this.responses(jQuery.map( data.responses, function( respData ) {
        return (new Response(self)).loadJS(respData);
    } ));
    this.elements(data.elements);
    return this;
};

MediaEditorData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name:  this.name(),
        minPresentationTime: this.minPresentationTime(),
        maxPresentationTime: this.maxPresentationTime(),
        portHandler:this.portHandler.toJS(),
        canvasElement: this.canvasElement.toJS(),
        responses: jQuery.map( this.responses(), function( resp ) { return resp.toJS(); } ),
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};


