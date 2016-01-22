// � by Caspar Goeke and Holger Finger



var Port = function(portHandler) {

    this.portHandler = portHandler;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Port";
    this.name = ko.observable("");
    this.portType = ko.observable("executeIn"); // or executeOut or variabelIn or variableOut

    // helper
    this.connectedToPorts = [];
};


Port.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.portType(data.portType);

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
