var node = !(typeof exports === 'undefined');
if (node) {

}

(function (exports) {

    var ExpRunData = function () {
        // this class is also used on server, so don't use knockout here:
        this.subjCounterGlobal = 0;
        this.subjCounterPerGroup = [0];

        /*this.var_values_by_id = {
            "98fdg89dfg983jf034jj34f0304f34f": 5,
            "fdlkdsfgkjsdhlgksjdflfhasdjfhjs": 324
        };*/

    };

    ExpRunData.prototype.fromJS = function (data) {
        this.subjCounterGlobal = data.subjCounterGlobal;
        this.subjCounterPerGroup = data.subjCounterPerGroup;
    };

    ExpRunData.prototype.toJS = function () {
        return {
            subjCounterGlobal: this.subjCounterGlobal,
            subjCounterPerGroup: this.subjCounterPerGroup
        };
    };

    exports.ExpRunData = ExpRunData;

})(node ? exports : window);