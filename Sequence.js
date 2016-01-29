// � by Caspar Goeke and Holger Finger


var Sequence = function (expData) {

    var self = this;
    this.expData = expData;
    this.currSelectedElement = ko.observable();
    this.parent = null;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Sequence";
    this.name = ko.observable("Sequence");

    // sub-Structures (serialized below)
    this.elements = ko.observableArray().extend({sortById: null});

    // helper:
    this.startBlock = null;
};

Sequence.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        var elem = self.expData.entities.byId[id];
        elem.parent = self;
        if (elem.type == "StartBlock"){
            self.startBlock = elem;
        }
        return elem;
    } ));
};

Sequence.prototype.selectNextElement = function() {
    if (this.startBlock){
        // this sequence uses connections for the control flow:
        if (!this.currSelectedElement()){
            var nextElement = this.startBlock;
        }
        else {
            var executeOutPort = this.currSelectedElement().portHandler.portsByType['executeOut'][0];
            var executeInPortOfNextElem = executeOutPort.connectedToPorts[0];
            var nextElement = executeInPortOfNextElem.portHandler.parentDataModel;
        }
    }
    else {
        // this sequence has just a linear control flow in array order:
        var elements = this.elements();
        if (!this.currSelectedElement()){
            var nextElement = elements[0];
        }
        else {
            var index = elements.indexOf(this.currSelectedElement());
            var nextElement = elements[index+1];
        }
    }

    this.currSelectedElement(nextElement);
    return nextElement;
};

Sequence.prototype.addNewSubElement = function(elem) {
    this.elements.push(elem);
    this.expData.entities.push(elem);
    elem.parent = this;
    if (elem.type == "StartBlock"){
        this.startBlock = elem;
    }
};

Sequence.prototype.getElementById = function(id) {
    return  this.elements.byId[id];
};


Sequence.prototype.reAddEntities = function() {
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

Sequence.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.elements(data.elements);
    return this;
};

Sequence.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};
