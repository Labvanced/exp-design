// � by Caspar Goeke and Holger Finger


var PortHandler = function(parentDataModel) {

    var self = this;
    this.parentDataModel = parentDataModel;
    this.portTypes = this.parentDataModel.portTypes;

    // sub-Structures (serialized below)
    this.ports = ko.observableArray();

    // ordered Ports by Id callback:
    this.portsById = {};
    this.portsByType = {};
    this.ports.subscribe(function() {
        self.portsById = {};
        self.portsByType = {};
        var ports = self.ports();
        for (var i=0, len=ports.length; i<len; i++) {
            self.portsById[ports[i].id()] = ports[i];
            if (!self.portsByType[ports[i].portType()]){
                self.portsByType[ports[i].portType()] = [];
            }
            self.portsByType[ports[i].portType()].push(ports[i]);
        }
    });

    // add Ports
    var ports = [];
    for (var i = 0;i<this.portTypes.length;i++){
        var port = new Port(this);
        port.portType(this.portTypes[i]);
        ports.push(port);
    }
    this.ports(ports);




};


PortHandler.prototype.fromJS = function(data) {

    var ports = [];
    for (var i= 0, len=data.ports.length; i<len; i++) {
        var port = new Port(this);
        port.fromJS(data.ports[i]);
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
