// � by Caspar Goeke and Holger Finger
var Factor= function(expData,factorGroup) {
    var self = this;

    this.expData = expData;
    this.factorGroup =factorGroup;


};


Factor.prototype.fromJS = function(data) {
    var self = this;

    return this;
};

Factor.prototype.toJS = function() {

    return {

    };
};
