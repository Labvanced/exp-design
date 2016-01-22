// � by Caspar Goeke and Holger Finger


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

Connection.prototype.setPointers = function() {
    var self = this;
    this.makeConnection();
};

Connection.prototype.fromJS = function(data) {
    this.id(data.id);
    this.conn1(data.conn1);
    this.conn2(data.conn2);
    this.name(data.name);
    return this;
};

Connection.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        conn1: this.conn1(),
        conn2: this.conn2()
    };
};
