// � by Caspar Goeke and Holger Finger


var Sequence = function (expData) {

    var self = this;
    this.expData = expData;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Sequence";
    this.currSelectedElement = ko.observable("");
    this.name = ko.observable("Sequence");

    // not serialized
    this.shape = "square";
    this.label = "Experiment";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observableArray().extend({sortById: null});
    this.elementsById = {};
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);

    // add Ports to Renderer
    this.canvasElement.addPorts(this.portHandler.ports());
};

Sequence.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
};

Sequence.prototype.getElementById = function(id) {
    return  this.elements.byId[id];
};

Sequence.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.experimentEditor.setDataModel(this);
};

Sequence.prototype.fromJS = function(sequence) {

    this.id(sequence.id);
    this.name(sequence.name);
    this.portHandler.fromJS(sequence.portHandler);
    this.canvasElement.fromJS(sequence.canvasElement);
    this.elements(sequence.elements);

    return this;
};


Sequence.prototype.reAddEntities = function() {
    var self = this;

    // add the direct child nodes:
    jQuery.each( this.elements(), function( index, elem ) {
        // check if they are not already in the list:
        if (!self.expData.entities.byId.hasOwnProperty(elem.id()))
            self.expData.entities.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.hasOwnProperty('reAddEntities'))
            elem.reAddEntities();
    } );

};

Sequence.prototype.toJS = function() {

    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        currSelectedElement: this.currSelectedElement(),
        portHandler:this.portHandler.toJS(),
        canvasElement: this.canvasElement.toJS(),
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};
