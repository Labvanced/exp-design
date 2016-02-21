
var ConnectionView = function(dataModel) {
    var self = this;

    this.dataModel = dataModel;
    this.expData = dataModel.expData;
    this.container = new createjs.Container();

    this.element1 = null;
    this.element2 = null;
    this.port1 = null;
    this.port2 = null;


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

    function recalc1pos() {
        if (self.port1.canvasShape) {
            self.xStart(self.element1.editorX() + self.port1.canvasShape.x);
            self.yStart(self.element1.editorY() + self.port1.canvasShape.y);
        }
    }
    function conn1Changed() {
        if (self.dataModel.conn1()) {
            //console.log("conn1changed");
            self.element1 = self.expData.entities.byId[self.dataModel.conn1().id];
            self.port1 = self.element1.portHandler.portsById[self.dataModel.conn1().portId];
            self.element1.editorX.subscribe(function(){
                recalc1pos();
            });
            self.element1.editorY.subscribe(function(){
                recalc1pos();
            });
            recalc1pos();
        }
    }
    this.dataModel.conn1.subscribe(conn1Changed);
    conn1Changed();

    function recalc2pos() {
        if (self.port2.canvasShape) {
            self.xEnd(self.element2.editorX() + self.port2.canvasShape.x);
            self.yEnd(self.element2.editorY() + self.port2.canvasShape.y);
        }
    }
    function conn2Changed() {
        if (self.dataModel.conn2()) {
            //console.log("conn2changed");
            self.element2 = self.expData.entities.byId[self.dataModel.conn2().id];
            self.port2 = self.element2.portHandler.portsById[self.dataModel.conn2().portId];
            self.element2.editorX.subscribe(function(){
                recalc2pos();
            });
            self.element2.editorY.subscribe(function(){
                recalc2pos();
            });
            recalc2pos();
        }
    }
    this.dataModel.conn2.subscribe(conn2Changed);
    conn2Changed();


};

ConnectionView.prototype.draw = function() {

    this.container.removeAllChildren();

    var polygon = new createjs.Shape();
    polygon.graphics.beginStroke("#414141").setStrokeStyle(3);
    polygon.graphics.moveTo(this.xStart(), this.yStart()).lineTo(this.xEnd(), this.yEnd());

    this.container.addChild(polygon);


};
