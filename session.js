// © by Caspar Goeke and Holger Finger

var Session = function () {

    this.blocks = ko.observableArray([]);
    this.name = ko.observable("newSession");
    var block1 = new Sequence();
    this.blocks.push(block1);

};


Session.prototype.setPointers = function() {
    this.blocks.setPointers();
};


Session.prototype.fromJS = function(session_data) {
    var blocks = [];
    if (session_data.hasOwnProperty('sessions')) {
        for (var i= 0, len=session_data.blocks.length; i<len; i++) {
            this.blocks.push(new Sequence());
            blocks[i].fromJS(session_data.sessions[i]);
        }
    }
    this.blocks(blocks);
    return this;
};


Session.prototype.toJS = function() {

    return {
        blocks: this.blocks.toJS()
    };

};
