/**
 * Created by kstandvoss on 15/02/16.
 */


var NewPageElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "newPage";
    this.id = ko.observable(guid());
    this.returnButton = ko.observable(true);
    this.selected = ko.observable(false);
    this.tag = ko.observable("");
};


NewPageElement.prototype.setPointers = function() {

};

NewPageElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText()
    };
};

NewPageElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
};

ko.components.register('newPage-element-edit', {
    viewModel: function(dataModel){
        this.returnButton = dataModel.returnButton;
        this.previousMandatory = dataModel

    } ,
    template:
        '<div class="panel-body">\
            <span>\
                <h5 style="display: inline-block; vertical-align: middle; font-size: medium">Return: </h5>\
                <input style="display: inline-block; transform: scale(1.3); vertical-align: middle; margin-left: 5px" type="checkbox" data-bind="checked: returnButton">\
            </span>\
        </div>'
});


ko.components.register('newPage-element-preview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.returnButton = dataModel.returnButton;
    },
    template:
        '<div class="panel-body">' +
        '<span style="float: right"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>' +
        '   <div style="margin: auto; max-width: 40%">' +
        '       <img style="float: right;" src="/resources/next.png"/></img>' +
        '       <img data-bind="visible: returnButton" style="float: left; -moz-transform: scale(-1, 1);' +
        ' -webkit-transform: scale(-1, 1); -o-transform: scale(-1, 1); -ms-transform: scale(-1, 1); transform: scale(-1, 1);" src="/resources/next.png">' +
        '   </div>' +
        '</div>'
});