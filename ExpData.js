
var ExpData = function () {

    this.sequence = new Sequence();

};

ExpData.prototype.fromJS = function(exp_data) {
    this.sequence = new Sequence();
    if (exp_data.hasOwnProperty('sequence'))
        this.sequence.fromJS(exp_data.sequence);
    return this;
};

ExpData.prototype.toJS = function() {
    return {
        sequence: this.sequence.toJS()
    };
};