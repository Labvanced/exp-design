



var Port = function(element) {

    var self = this;
    this.element = element;
    this.type = "execute";
    this.name = ko.observable("");
    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.id = ko.observable(guid());

    var circle = new createjs.Shape();
    circle.graphics.setStrokeStyle(8).beginStroke("red").drawCircle(0, 0, 3);


    circle.addEventListener("click", function (ev) {
        // start creating a connection:
        var connSpec = {
            id: self.element.id(),
            portId: self.id()
        };
        uc.experimentEditor.createConnection(connSpec);
    });


    this.container = new createjs.Container();
    this.container.addChild(circle);

    this.x.subscribe(function(x){
        self.container.x = x;
    });

    this.y.subscribe(function(y){
        self.container.y = y;
    });

};


Port.prototype.fromJS = function(port) {
    this.id(port.id);
    this.x(port.x);
    this.y(port.y);
    this.name(port.name);
    return this;
};


Port.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        x: this.x(),
        y: this.y(),
        name: this.name()
    };
};
