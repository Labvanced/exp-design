



var Port = function(element) {

    this.element = element;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Port";
    this.name = ko.observable("");

    // not serialized
    this.shape = "circle";
    this.label = "";

    // sub-Structures (serialized below)
    this.canvasElement = new CanvasElement(this);
};


Port.prototype.fromJS = function(portData) {
    this.id(portData.id);
    this.type = portData.type;
    this.name(portData.name);
    this.canvasElement.fromJS(portData.canvasElement);

    return this;
};


Port.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        canvasElement: this.canvasElement.toJS()
    };
};
