// � by Caspar Goeke and Holger Finger

/**
 * This class is the data-model of a connection that can connect two objects in the canvas.
 * @param expData
 * @constructor
 */
var Connection = function(expData) {
    this.expData = expData;
    this.parent = null;

    // serialized:
    this.type = "Connection";
    this.name = ko.observable("Connection");
    this.conn1 = ko.observable(null); // is an object with keys id and portId, that refer to the object and the port.
    this.conn2 = ko.observable(null); // is an object with keys id and portId, that refer to the object and the port.
    this.id = ko.observable(guid());
};

/**
 * sets the state of other ports to relect this connection.
 */
Connection.prototype.makeConnection = function() {
    var conn1 = this.conn1();
    var conn2 = this.conn2();
    if (conn1 && conn2){
        var elem1 = this.parent.elements.byId[conn1.id];
        var port1 = elem1.portHandler.portsById[conn1.portId];
        var elem2 = this.parent.elements.byId[conn2.id];
        var port2 = elem2.portHandler.portsById[conn2.portId];
        port1.connectedToPorts.push(port2);
        port2.connectedToPorts.push(port1);
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Connection.prototype.setPointers = function(entitiesArr) {
    this.makeConnection();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Connection}
 */
Connection.prototype.fromJS = function(data) {
    this.id(data.id);
    this.conn1(data.conn1);
    this.conn2(data.conn2);
    this.name(data.name);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {{id: *, type: *, name: *, conn1: *, conn2: *}}
 */
Connection.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        conn1: this.conn1(),
        conn2: this.conn2()
    };
};
