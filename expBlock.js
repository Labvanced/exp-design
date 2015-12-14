// � by Caspar Goeke and Holger Finger

var ExpBlock = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("block_1");
    this.type = "ExpBlock";
    this.subSequence = ko.observable(new Sequence(expData));
    this.editName =  ko.observable(false);
};

ExpBlock.prototype.setPointers = function() {
    // convert id of subSequence to actual pointer:
    return this.subSequence(this.expData.entities.byId[this.subSequence()]);
};





ExpBlock.prototype.rename = function(idx,flag,data,event) {
    event.stopImmediatePropagation();
    if (flag == "true"){
        this.editName(true);
    }
    else if (flag == "false"){
        this.editName(false);
    }

};


ExpBlock.prototype.reAddEntities = function() {
    var self = this;

    // add the direct child nodes:
    // check if they are not already in the list:
    if (!self.expData.entities.byId.hasOwnProperty(this.subSequence().id()))
        self.expData.entities.push(this.subSequence());

    // recursively make sure that all deep tree nodes are in the entities list:
    this.subSequence().reAddEntities();
};

ExpBlock.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.subSequence(data.subSequence);
    return this;
};

ExpBlock.prototype.toJS = function() {

    return {
        id: this.id(),
        name: this.name(),
        type: this.type,
        subSequence: this.subSequence().id()
    };

};
