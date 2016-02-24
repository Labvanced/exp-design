// � by Caspar Goeke and Holger Finger


var TextElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "text";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("Your Question");
    this.selected = ko.observable(false);
    this.tag = ko.observable("");
};


TextElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[9].text);
    globalVar.dataType("string");
    globalVar.name(this.tag);
    globalVar.scope('questionnaire');
    globalVar.scale('nominal');
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
        var self = this;
        this.questionText = dataModel.questionText;
        this.tag = dataModel.tag;

        tinymce.editors = [];

        tinymce.init({
            selector: "#myTextEditor",
            menubar:false,
            statusbar: false,

            oninit: function(){
                tinyMCE.activeEditor.setContent(self.questionText());
                tinyMCE.execCommand('mceRepaint'); //can be needed
            },

            theme_advanced_disable : "bold,italic",
            plugins: [
                "image  preview ",
                "searchreplace ",
                "insertdatetime  table contextmenu paste",
                "autoresize"
            ],
            toolbar: " undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",

            width: "100%",
            height: "100%",
            autoresize_bottom_margin: 50
        });
    } ,
    template:
        '<div class="panel-body">\
                <div id="toolbar" class="ui-layout-content"></div>\
                <form id="newtextArea" class="quest-form2" action="javascript:void(0);">\
                    <textarea data-bind="tinymce: questionText" id="myTextEditor" name="content" style="width:100%; height:100%"></textarea>\
                </form>\
                <br><br>\
        </div>'
});


ko.components.register('text-element-preview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
    },
    template:
    '<div class="panel-heading">\
        <span style="float: right"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
        <h3 style="float: left">\
            <span data-bind="html: questionText"></span>\
        </h3>\
      </div>\
      <br><br><br><br>\
        <div class="panel-body"><input style="position:relative;left: 0%; max-width:50%"\
            disabled type="text"\
            class="form-control"\
            placeholder="Participant Answer">\
      </div>'
});

