/**
 * Created by cgoeke on 2/12/16.
 */


var RecData = function(variableId,data) {

    this.variableId = variableId;
    this.data = data;

};


RecData.prototype.fromJS = function(data) {
    this.variableId =data.variableId;
    this.data = data.data;
    return this;
};


RecData.prototype.toJS = function() {
    return {
        variableId: this.variableId,
        data: this.data
    };
};
