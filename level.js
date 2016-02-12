/**
 * Created by cgoeke on 12/14/15.
 */

// � by Caspar Goeke and Holger Finger

var Level = function (name) {
    this.type = "Level";
    this.name = ko.observable(name);
    this.editName =  ko.observable(false);
};



Level.prototype.setPointers = function(entitiesArr) {
};


Level.prototype.fromJS = function(data) {

    this.name(data.name);
    this.type = data.type;
    this.editName(data.editName);
    return this;
};

Level.prototype.toJS = function() {
    return {

        name: this.name(),
        type: this.type,
        editName: this.editName()
    };
};

