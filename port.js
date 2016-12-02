// � by Caspar Goeke and Holger Finger


/**
 * This class stores the port that handles the connection between items on a canvas.
 *
 * @param portHandler
 * @constructor
 */
var Port = function(portHandler) {

    this.portHandler = portHandler;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Port";
    this.name = ko.observable("");
    this.portType = ko.observable("executeIn"); // or executeOut or variabelIn or variableOut

    // helper
    this.connectedToPorts = [];
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Port}
 */
Port.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.portType(data.portType);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
Port.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        portType: this.portType()
    };
};
