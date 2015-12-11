// � by Caspar Goeke and Holger Finger


var Connection = function(expData) {
    this.expData = expData;
    this.parent = null;

    // serialized:
    this.type = "Connection";
    this.name = ko.observable("Connection");
    this.conn1 = ko.observable(null);
    this.conn2 = ko.observable(null);
    this.id = ko.observable(guid());
};

Connection.prototype.setPointers = function() {
    var self = this;
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
