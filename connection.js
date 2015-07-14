


var Connection = function() {
    var self = this;
    this.type = "Connection";
    this.conn1 = ko.observable(0);
    this.conn2 = ko.observable(0);
    this.container = new createjs.Container();
};


Connection.prototype.fromJS = function(conn) {
    this.conn1(conn.conn1);
    this.conn2(conn.conn2);
    return this;
};


Connection.prototype.toJS = function() {
    return {
        conn1: this.conn1(),
        conn2: this.conn2()
    };
};
