



var Port = function(element) {

    var self = this;
    this.element = element;
    this.type = "execute";
    this.name = ko.observable("");
    this.id = ko.observable(guid());

    this.canvasElement = new CanvasElement(this);
};


Port.prototype.fromJS = function(port) {
    this.id(port.id);
    this.canvasElement.fromJS(port);
    this.name(port.name);
    return this;
};


Port.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        canvasElement: this.canvasElement.toJS(),
        name: this.name()
    };
};
