


var Connection = function(sequence) {
    var self = this;
    this.sequence = sequence;
    this.type = "Connection";
    this.conn1 = ko.observable(null);
    this.conn2 = ko.observable(null);
    this.container = new createjs.Container();
    this.id = ko.observable(guid());

    this.xStart = ko.observable(0);
    this.yStart = ko.observable(0);
    this.xEnd = ko.observable(0);
    this.yEnd = ko.observable(0);

    this.xStart.subscribe(function(){
        self.draw();
    });
    this.yStart.subscribe(function(){
        self.draw();
    });
    this.xEnd.subscribe(function(){
        self.draw();
    });
    this.yEnd.subscribe(function(){
        self.draw();
    });


    this.element1 = null;
    this.element2 = null;
    this.port1 = null;
    this.port2 = null;


};



Connection.prototype.setPointers = function() {

    var self = this;

    function recalc1pos() {
        self.xStart(self.element1.x() + self.port1.x());
        self.yStart(self.element1.y() + self.port1.y());
    }
    function conn1Changed() {
        if (self.conn1()) {
            console.log("conn1changed");
            self.element1 = self.sequence.elementsById[self.conn1().id];
            self.port1 = self.element1.portsById[self.conn1().portId];
            self.element1.x.subscribe(function(){
                recalc1pos();
            });
            self.element1.y.subscribe(function(){
                recalc1pos();
            });
            recalc1pos();
        }
    }
    this.conn1.subscribe(conn1Changed);
    conn1Changed();

    function recalc2pos() {
        self.xEnd(self.element2.x() + self.port2.x());
        self.yEnd(self.element2.y() + self.port2.y());
    }
    function conn2Changed() {
        if (self.conn2()) {
            console.log("conn2changed");
            self.element2 = self.sequence.elementsById[self.conn2().id];
            self.port2 = self.element2.portsById[self.conn2().portId];
            self.element2.x.subscribe(function(){
                recalc2pos();
            });
            self.element2.y.subscribe(function(){
                recalc2pos();
            });
            recalc2pos();
        }
    }
    this.conn2.subscribe(conn2Changed);
    conn2Changed();
};



Connection.prototype.draw = function() {


    this.container.removeAllChildren();

        var polygon = new createjs.Shape();
        polygon.graphics.beginStroke("black");
        polygon.graphics.moveTo(this.xStart(), this.yStart()).lineTo(this.xEnd(), this.yEnd());

    this.container.addChild(polygon);


};



Connection.prototype.fromJS = function(conn) {
    this.id(conn.id);
    this.conn1(conn.conn1);
    this.conn2(conn.conn2);
    return this;
};


Connection.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        conn1: this.conn1(),
        conn2: this.conn2()
    };
};
