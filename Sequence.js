// � by Caspar Goeke and Holger Finger


var Sequence = function (expData) {

    var self = this;
    this.expData = expData;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Sequence";
    this.name = ko.observable("Sequence");

    // sub-Structures (serialized below)
    this.elements = ko.observableArray().extend({sortById: null});
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
