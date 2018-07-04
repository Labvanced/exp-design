// � by Caspar Goeke and Holger Finger

/**
 * Stores the specification of one experimental session.
 *
 * @param expData
 * @constructor
 */
var ExpSession = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("session_1");
    this.type = "ExpSession";
    this.blockRandomization = ko.observable('fixed');
    this.blocks = ko.observableArray([]);
};

ExpSession.prototype.addBlock = function(block) {
    return this.blocks.push(block);
};

ExpSession.prototype.removeBlock = function(data,event) {

    var idx = this.blocks().indexOf(data);
    if (idx ==-1){
        console.log('bad deletion');
    }
    else{
        //this.blocks.splice(idx,1);
        //this.blocks.valueHasMutated()
        var tmpArr = this.blocks();
        tmpArr.splice(idx,1);
        this.blocks(tmpArr);
    }


};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpSession.prototype.setPointers = function(entitiesArr) {
    // convert ids to actual pointers:
    this.blocks(jQuery.map( this.blocks(), function( id ) {
        return entitiesArr.byId[id];
    } ));
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpSession.prototype.reAddEntities = function(entitiesArr) {
    // add the direct child nodes:
    jQuery.each( this.blocks(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        elem.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ExpSession}
 */
ExpSession.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.blocks(data.blocks);
    this.blockRandomization(data.blockRandomization);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ExpSession.prototype.toJS = function() {

    return {
        id: this.id(),
        name: this.name(),
        type: this.type,
        blockRandomization:this.blockRandomization(),
        blocks: jQuery.map( this.blocks(), function( elem ) { return elem.id(); } )
    };

};
