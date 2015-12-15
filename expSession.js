// � by Caspar Goeke and Holger Finger

var ExpSession = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("session_1");
    this.type = "ExpSession";
    this.blocks = ko.observableArray([]).extend({sortById: null});
    this.editName =  ko.observable(false);
};

ExpSession.prototype.addBlock = function(block) {
    return this.blocks.push(block);
};

ExpSession.prototype.rename = function(idx,flag,data,event) {
    event.stopImmediatePropagation();
    if (flag == "true"){
        this.editName(true);
    }
    else if (flag == "false"){
        this.editName(false);
    }

};

ExpSession.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.blocks(jQuery.map( this.blocks(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
};

ExpSession.prototype.reAddEntities = function() {
    var self = this;

    // add the direct child nodes:
    jQuery.each( this.blocks(), function( index, elem ) {
        // check if they are not already in the list:
        if (!self.expData.entities.byId.hasOwnProperty(elem.id()))
            self.expData.entities.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        elem.reAddEntities();
    } );
};

ExpSession.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.blocks(data.blocks);
    return this;
};

ExpSession.prototype.toJS = function() {

    return {
        id: this.id(),
        name: this.name(),
        type: this.type,
        blocks: jQuery.map( this.blocks(), function( elem ) { return elem.id(); } )
    };

};
