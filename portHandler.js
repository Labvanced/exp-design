var PortHandler = function(parentDataModel) {

    var self = this;
    this.parentDataModel = parentDataModel;
    this.portTypes = this.parentDataModel.portTypes;

    // sub-Structures (serialized below)
    this.ports = ko.observableArray();

    // ordered Ports by Id callback:
    this.portsById = {};
    this.ports.subscribe(function() {
        self.portsById = {};
        var ports = self.ports();
        for (var i= 0, len=ports.length; i<len; i++) {
            self.portsById[ports[i].id()] = ports[i];
        }
    });

    // add Ports
    for (var i = 0;i<this.portTypes.length;i++){
        var port = new Port(this);
        port.portType(this.portTypes[i]);
        this.ports.push(port);
    }

};


PortHandler.prototype.fromJS = function(portData) {

    var ports = [];
    for (var i= 0, len=portData.ports.length; i<len; i++) {
        var port = new Port(this);
        port.fromJS(portData.ports[i]);
        ports.push(port);
    }
    this.ports(ports);

    return this;
};


PortHandler.prototype.toJS = function() {
    var ports = this.ports();
    var portsSerialized = [];
    for (var i= 0, len=ports.length; i<len; i++) {
        portsSerialized.push(ports[i].toJS());
    }

    return {
        ports: portsSerialized
    };
};
