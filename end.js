// � by Caspar Goeke and Holger Finger

/**
 * Representing the end of a sequence of tasks.
 *
 * @param expData
 * @constructor
 */
var EndBlock = function(expData) {

    this.expData = expData;
    this.parent = null;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.editorWidth = ko.observable(120);
    this.editorHeight = ko.observable(60);
    this.id = ko.observable(guid());
    this.type = "EndBlock";
    this.name = ko.observable("End");

    // not serialized
    this.shape = "circle";
    this.label = "End";
    this.portTypes = ["executeIn"];

    // sub-Structures (serialized below)
    this.portHandler = new PortHandler(this);

};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
EndBlock.prototype.setPointers = function() {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {EndBlock}
 */
EndBlock.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {{id: *, type: *, name: *, portHandler, editorX: *, editorY: *, editorWidth: *, editorHeight: *}}
 */
EndBlock.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        portHandler:this.portHandler.toJS(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        editorWidth: this.editorWidth(),
        editorHeight: this.editorHeight()
    };
};

