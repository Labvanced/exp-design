// © by Caspar Goeke and Holger Finger



var Port = function(portHandler) {

    this.portHandler = portHandler;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Port";
    this.name = ko.observable("");
    this.portType = ko.observable("executeIn"); // or executeOut or variabelIn or variableOut

    this.canvasShape = null; // will be created by canvasElement.js

};


Port.prototype.fromJS = function(portData) {
    this.id(portData.id);
    this.type = portData.type;
    this.name(portData.name);
    this.portType(portData.portType);

    return this;
};


Port.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        portType: this.portType()
    };
};
