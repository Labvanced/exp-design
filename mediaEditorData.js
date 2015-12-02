// � by Caspar Goeke and Holger Finger


var MediaEditorData = function(expData) {
    
    var self = this;
    this.expData = expData;

    // serialized
    this.id = ko.observable(guid());
    this.type = "MediaEditorData";
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


MediaEditorData.prototype.reAddEntities = function() {
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

MediaEditorData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.maxPresentationTime(data.maxPresentationTime);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
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
        maxPresentationTime: this.maxPresentationTime(),
        portHandler: this.portHandler.toJS(),
        canvasElement: this.canvasElement.toJS(),
        responses: jQuery.map( this.responses(), function( resp ) { return resp.toJS(); } ),
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};


