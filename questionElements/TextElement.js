// � by Caspar Goeke and Holger Finger


var TextElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "text";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("");
    this.newPage = ko.observable(false);
};

TextElement.prototype.setPointers = function() {

};

TextElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText()
    };
};

TextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
};

ko.components.register('text-element-edit', {
    viewModel: function(dataModel){

        this.questionText = dataModel.questionText;

    } ,
    template:
        '<div class="panel-body">\
                <input style="max-width:50%" type="text" data-bind="textInput: questionText"\
                class="form-control" placeholder="Your Question">\
                    <input style="max-width:50%" disabled type="text" class="form-control"\
                placeholder="Participant Answer">\
                    <br><br>\
                    </div>\
        </div>'
});


ko.components.register('text-element-preview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.newPage = dataModel.newPage;
    },
    template:
    '<div class="panel-heading">\
        <span style="float: right"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
        <h3 style="float: left">\
            <span data-bind="text: questionText"></span>\
        </h3>\
      </div>\
      <br><br><br><br>\
        <div class="panel-body"><input style="position:relative;left: 0%; max-width:50%"\
            disabled type="text"\
            class="form-control"\
            placeholder="Participant Answer">\
      </div>\
      <div data-bind="visible: newPage">\
                <img style="float: right" src="/resources/next.png">\
        </div>'
});

