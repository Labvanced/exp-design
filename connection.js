// � by Caspar Goeke and Holger Finger


var Connection = function(expData) {
    var self = this;
    this.expData = expData;
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
        self.xStart(self.element1.canvasElement.x() + self.port1.canvasShape.x);
        self.yStart(self.element1.canvasElement.y() + self.port1.canvasShape.y);
    }
    function conn1Changed() {
        if (self.conn1()) {
            //console.log("conn1changed");
            self.element1 = self.expData.entities.byId[self.conn1().id];
            self.port1 = self.element1.portHandler.portsById[self.conn1().portId];
            self.element1.canvasElement.x.subscribe(function(){
                recalc1pos();
            });
            self.element1.canvasElement.y.subscribe(function(){
                recalc1pos();
            });
            recalc1pos();
        }
    }
    this.conn1.subscribe(conn1Changed);
    conn1Changed();

    function recalc2pos() {
        self.xEnd(self.element2.canvasElement.x() + self.port2.canvasShape.x);
        self.yEnd(self.element2.canvasElement.y() + self.port2.canvasShape.y);
    }
    function conn2Changed() {
        if (self.conn2()) {
            //console.log("conn2changed");
            self.element2 = self.expData.entities.byId[self.conn2().id];
            self.port2 = self.element2.portHandler.portsById[self.conn2().portId];
            self.element2.canvasElement.x.subscribe(function(){
                recalc2pos();
            });
            self.element2.canvasElement.y.subscribe(function(){
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
        polygon.graphics.beginStroke("black").setStrokeStyle(3);
        polygon.graphics.moveTo(this.xStart(), this.yStart()).lineTo(this.xEnd(), this.yEnd());

    this.container.addChild(polygon);


};



Connection.prototype.fromJS = function(data) {
    this.id(data.id);
    this.conn1(data.conn1);
    this.conn2(data.conn2);
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
