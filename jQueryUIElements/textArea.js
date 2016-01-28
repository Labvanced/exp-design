// � by Caspar Goeke and Holger Finger


var TextArea = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "textArea";
    this.id = ko.observable(guid());
    this.editing=  ko.observable(true);
    this.content = ko.observable("");
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.editorWidth = ko.observable(120);
    this.editorHeight = ko.observable(60);
    this.name = ko.observable("textArea");
    this.onset = ko.observable(0);
    this.onsetEnabled = ko.observable(false);
    this.offset = ko.observable(0);
    this.offsetEnabled = ko.observable(false);
    this.responses = ko.observableArray([]);
    this.isActive = ko.observable(true);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

};

TextArea.prototype.modifiableProp = ["editorX", "editorY", "editorWidth","editorHeight","name","onset","onsetEnabled","offset","offsetEnabled","isActive"];

TextArea.prototype.setPointers = function() {
    this.modifier().setPointers();
};


ImageData.prototype.addNewResponse = function() {
    var resp = new Response(this);
    resp.responseType("mouse");
    this.responses.push(resp);
};



TextArea.prototype.finishQuestion = function() {
    this.editing(false);
};





TextArea.prototype.fromJS = function(data) {
    var self = this;
    this.id(data.id);
    this.type = data.type;
    this.content(data.content);
    this.name(data.name);
    this.onset(data.onset);
    this.onsetEnabled(data.onsetEnabled);
    this.offset(data.offset);
    this.offsetEnabled(data.offsetEnabled);
    this.responses(jQuery.map( data.responses, function( respData ) {
        return (new Response(self)).fromJS(respData);
    } ));
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    this.isActive(data.isActive);
    return this;
};

TextArea.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        content: this.content(),
        name: this.name(),
        onset: this.onset(),
        onsetEnabled: this.onsetEnabled(),
        offset: this.offset(),
        offsetEnabled: this.offsetEnabled(),
        responses: jQuery.map( this.responses(), function( resp ) { return resp.toJS(); } ),
        modifier: this.modifier().toJS(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        editorWidth: this.editorWidth(),
        editorHeight: this.editorHeight(),
        isActive:  this.isActive(),
        keepAspectRatio: this.data.keepAspectRatio()
    };
};
