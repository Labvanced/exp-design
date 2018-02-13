
var ExpRunData = function() {
    this.subjCounterGlobal = 0;
    this.subjCounterPerGroup = [0];
};

ExpRunData.prototype.fromJS = function(data) {
    this.subjCounterGlobal(data.subjCounterGlobal);
    this.subjCounterPerGroup(data.subjCounterPerGroup);
};

ExpRunData.prototype.toJS = function() {
    return {
        subjCounterGlobal: this.subjCounterGlobal(),
        subjCounterPerGroup: this.subjCounterPerGroup()
    };
};
