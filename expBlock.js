// � by Caspar Goeke and Holger Finger


/**
 * This class stores an experimental block, that could include different tasks.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var ExpBlock = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("block_1");
    this.type = "ExpBlock";
    this.subTasks = ko.observableArray([]);
    this.editName =  ko.observable(false);
};

ExpBlock.prototype.rename = function(idx,flag,data,event) {
    event.stopImmediatePropagation();
    if (flag == "true"){
        this.editName(true);
    }
    else if (flag == "false"){
        this.editName(false);
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpBlock.prototype.setPointers = function(entitiesArr) {
    // convert ids to actual pointers:
    this.subTasks(jQuery.map( this.subTasks(), function( id ) {
        var subTask = entitiesArr.byId[id];
        return subTask;
    } ));
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpBlock.prototype.reAddEntities = function(entitiesArr) {
    // add the direct child nodes:
    jQuery.each( this.subTasks(), function( index, subTask ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(subTask.id()))
            entitiesArr.push(subTask);

        // recursively make sure that all deep tree nodes are in the entities list:
        if (subTask.reAddEntities)
            subTask.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ExpBlock}
 */
ExpBlock.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.subTasks(data.subTasks);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ExpBlock.prototype.toJS = function() {

    return {
        id: this.id(),
        name: this.name(),
        type: this.type,
        subTasks: jQuery.map( this.subTasks(), function( subTask ) { return subTask.id(); } )
    };

};
