/**
 * Created by kstandvoss on 24/03/16.
 */

var htmlElementData= function(expData) {

    this.expData = expData;
    this.parent = null;

    // serialized
    this.editorX = ko.observable(100).extend({ numeric: 2 });
    this.editorY = ko.observable(100).extend({ numeric: 2 });
    this.editorWidth = ko.observable(320).extend({ numeric: 2 });
    this.editorHeight = ko.observable(180).extend({ numeric: 2 });
    this.contentScaling = ko.observable(1).extend({ numeric: 2 });
    this.anchorPointX = ko.observable('center');
    this.anchorPointY = ko.observable('center');
    this.visibility = ko.observable(1).extend({ numeric: 2 });
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


    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

htmlElementData.prototype.addContent = function(element){
    this.content(element);
    element.parent = this;
};

htmlElementData.prototype.dataType =      [ "numeric", "numeric", "numeric", "numeric","numeric","string","string","boolean","string","boolean","boolean","boolean","boolean"];
htmlElementData.prototype.modifiableProp = ["visibility","editorX", "editorY", "editorWidth","editorHeight", "name","onset","onsetEnabled","offset","offsetEnabled","isActive","keepAspectRatio","contentScaling"];

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

htmlElementData.prototype.setAnchorPoint = function(horizontal,vertical) {
    this.anchorPointX(horizontal);
    this.anchorPointY(vertical);
    // TODO: convert old x and y coordinates to new coordinates such that the element does not move when switching modes.
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
    this.dataType = data.dataType;
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
    if(data.contentScaling) {
        this.contentScaling(data.contentScaling);
    }
    if(data.anchorPointX) {
        this.anchorPointX(data.anchorPointX);
    }
    if(data.anchorPointY) {
        this.anchorPointY(data.anchorPointY);
    }
    this.visibility(data.visibility);
    this.isActive(data.isActive);
    this.keepAspectRatio(data.keepAspectRatio);
    if(data.content){
        var content = new window[data.content.type](this.expData);
        content.fromJS(data.content);
        content.parent = this;
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
        dataType: this.dataType,
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
        contentScaling: this.contentScaling(),
        anchorPointX: this.anchorPointX(),
        anchorPointY: this.anchorPointY(),
        visibility: this.visibility(),
        isActive:  this.isActive(),
        keepAspectRatio: this.keepAspectRatio(),
        content: contentData
    };
};

