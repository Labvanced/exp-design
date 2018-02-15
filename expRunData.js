var node = !(typeof exports === 'undefined');
if (node) {

}

(function (exports) {

    var ExpRunData = function() {
        // this class is also used on server, so don't use knockout here:
        this.subjCounterGlobal = 0;
        this.subjCounterPerGroup = [0];
    };

    ExpRunData.prototype.fromJS = function(data) {
        this.subjCounterGlobal = data.subjCounterGlobal;
        this.subjCounterPerGroup = data.subjCounterPerGroup;
    };

    ExpRunData.prototype.toJS = function() {
        return {
            subjCounterGlobal: this.subjCounterGlobal,
            subjCounterPerGroup: this.subjCounterPerGroup
        };
    };

    exports.ExpRunData = ExpRunData;

})(node ? exports : window);