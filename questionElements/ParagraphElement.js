// � by Caspar Goeke and Holger Finger

// PARAGRAPH ELEMENT //
var ParagraphElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "paragraph";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("");
    this.newPage= ko.observable(false);
};


ParagraphElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText()
    };
};

ParagraphElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
};

ko.components.register('paragraph-element-edit', {
    viewModel: function(dataModel){

        this.editing = dataModel.editing;
        this.questionText = dataModel.questionText;

    } ,
    template:
        '<div class="panel-body">\
            <input style="max-width:50%" type="text" data-bind="textInput: questionText"\
            class="form-control" placeholder="Your Question">\
            <textarea style="max-width:50%" disabled class="form-control"\
            placeholder="Participant Answer"></textarea>\
            <br><br>\
            </div>\
         </div>'

});

ko.components.register('paragraph-element-preview',{
   viewModel: function(dataModel){
       this.dataModel = dataModel;
       this.questionText = dataModel.questionText;
       this.newPage = dataModel.newPage;
   },
    template:
        '<div class="panel-heading">\
            <span style="float:right;;"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
            <h3 style="float: left">\
                <span data-bind="text: questionText"></span>\
            </h3>\
            <br><br><br><br>\
            <div class="panel-body"><textarea style="position:relative;left: 0%; max-width:50%"\
                   disabled class="form-control"\
                   placeholder="Participant Answer"></textarea>\
            </div>\
            <div data-bind="visible: newPage">\
                <img style="float: right" src="/resources/next.png">\
            </div> \
         </div>'
});

ko.applyBindings();