// � by Caspar Goeke and Holger Finger

var ExpBlock = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("block_1");
    this.type = "ExpBlock";
    this.subSequence = ko.observable(new Sequence(expData));
    this.subSequence().parent = this;
    this.editName =  ko.observable(false);
};

ExpBlock.prototype.setPointers = function(entitiesArr) {
    // convert id of subSequence to actual pointer:
    this.subSequence(entitiesArr.byId[this.subSequence()]);
    this.subSequence().parent = this;
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


ExpBlock.prototype.reAddEntities = function(entitiesArr) {
    var self = this;

    // add the direct child nodes:
    // check if they are not already in the list:.
    if (!entitiesArr.byId.hasOwnProperty(this.subSequence().id())) {
        entitiesArr.push(this.subSequence());
    }

    // recursively make sure that all deep tree nodes are in the entities list:
    this.subSequence().reAddEntities(entitiesArr);
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
