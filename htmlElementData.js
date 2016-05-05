/**
 * Created by kstandvoss on 24/03/16.
 */

var htmlElementData= function(expData) {

    this.expData = expData;
    this.parent = null;

    // serialized
    this.editorX = ko.observable(100);
    this.editorY = ko.observable(100);
    this.editorWidth = ko.observable(320);
    this.editorHeight = ko.observable(180);
    this.keepAspectRatio = ko.observable(false);
    this.id = ko.observable(guid());
    this.type = "htmlElementData";
    this.name = ko.observable("html");
    this.onset = ko.observable(0);
    this.onsetEnabled = ko.observable(false);
    this.offset = ko.observable(0);
    this.offsetEnabled = ko.observable(false);
    this.responses = ko.observableArray([]);
    this.isActive = ko.observable(true);
    this.content = ko.observable();

    // if this name changes, then also update the name property of the content and the variable:
    this.name.subscribe(function(newName) {
        if (this.content()) {
            if (this.content().name) {
                this.content().name(newName);
            }
            if (this.content().variable) {
                this.content().variable().name(newName);
            }
        }
    }, this);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

htmlElementData.prototype.addContent = function(element){
    this.content(element);
    element.parent = this;
};

htmlElementData.prototype.modifiableProp = ["editorX", "editorY", "editorWidth","editorHeight", "name","onset","onsetEnabled","offset","offsetEnabled","isActive","keepAspectRatio"];

htmlElementData.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);

    jQuery.each( this.responses(), function(idx, resp ) {
        resp.setPointers(entitiesArr);
    } );

    if(this.content().setPointers){
        this.content().setPointers(entitiesArr);
    }

};

htmlElementData.prototype.addNewResponse = function() {
    var resp = new Response(this);
    resp.responseType("mouse");
    this.responses.push(resp);
};

htmlElementData.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
    this.content().modifier().selectTrialType(selectionSpec);
};

htmlElementData.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);

    if(this.content().reAddEntities){
        this.content().reAddEntities(entitiesArr);
    }

};

htmlElementData.prototype.fromJS = function(data) {
    var self = this;
    this.id(data.id);
    this.type = data.type;
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
    this.keepAspectRatio(data.keepAspectRatio);
    if(data.content){
        var content = new window[data.content.type](this.expData);
        content.fromJS(data.content);
        this.content(content);
    }
    return this;
};

htmlElementData.prototype.toJS = function() {
    if(this.content()){
        var contentData = this.content().toJS();
    }
    else{
        contentData = null
    }
    return {
        id: this.id(),
        type: this.type,
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
        keepAspectRatio: this.keepAspectRatio(),
        content: contentData
    };
};

