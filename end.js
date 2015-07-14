


var EndBlock = function() {

    var self = this;

    this.type = "EndBlock";
    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.id = ko.observable(guid());
    this.container = new createjs.Container();

    var circ = new createjs.Shape();
    circ.graphics.beginStroke("black").beginFill("gray").drawCircle(0, 0, 40);
    circ.addEventListener("pressmove", function (ev) {
        var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
        self.setCoord( mouseAt.x, mouseAt.y  );
    });
    this.container.addChild(circ);

    var txt = new createjs.Text("End", "16px Arial", "#FFF");
    txt.textAlign = 'center';
    this.container.addChild(txt);

    var outputCirc = new createjs.Shape();
    outputCirc.graphics.setStrokeStyle(8).beginStroke("red").drawCircle(-40, 0, 3);
    this.container.addChild(outputCirc);

    self.setCoord(250, 200);

};


EndBlock.prototype.fromJS = function(end) {
    this.id(end.id);
    this.setCoord(end.x, end.y);
    return this;
};


EndBlock.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        x: this.x(),
        y: this.y()
    };
};


EndBlock.prototype.setCoord = function(x,y) {

    this.x(x);
    this.y(y);
    this.container.x = x;
    this.container.y = y;


    return this;
};