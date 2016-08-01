// � by Caspar Goeke and Holger Finger


var TextElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Text";

    //serialized
    this.type = "TextElement";
    this.questionText= ko.observable("Your Question");
    this.selected = ko.observable(false);
    this.variable = ko.observable();
    this.answer = ko.observable("");
    this.useRich = ko.observable(false);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

TextElement.prototype.modifiableProp = ["questionText"];

TextElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[7]);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.parent.name());
    this.variable(globalVar);
};

TextElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

TextElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

TextElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        questionText: this.questionText(),
        variable: variableId,
        answer: this.answer()
    };
};

TextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.variable(data.variable);
    this.answer(data.answer);
};

//TODO @Holger Add image FileManager, @Kai Multiple mceEditors
ko.components.register('text-element-edit', {
    viewModel: function(dataModel){
        this.sleep
        var self = this;
        this.questionText = dataModel.questionText;
        this.htmlText = ko.observable("Your Question");
        this.useRich = dataModel.useRich;
        this.name = dataModel.parent.name;

        $(document).on('focusin', function(e) {
            if ($(e.target).closest(".mce-window, .moxman-window").length) {
                e.stopImmediatePropagation();
            }
        });

        function removeTinyMCE() {
            tinyMCE.execCommand('mceFocus', false, 'myTextEditor');
            tinyMCE.execCommand('mceRemoveControl', false, 'myTextEditor');
        }

        function addTinyMCE() {
            if (typeof tinyMCE != 'undefined') {
                tinyMCE.execCommand('mceFocus', false, 'myTextEditor');
                tinyMCE.execCommand('mceRemoveControl', false, 'myTextEditor');
            }
            jQuery('#myTextEditor').tinymce({
                menubar: false,
                plugins: ['image'],
                mode: 'none'
                //file_browser_callback: \'FileManager\'}
            });
        }
        this.edit = function () {
            this.useRich(true);

            $("#dialog").dialog({
                width: 500,
                buttons: [
                    {
                        text: "Save",
                        click: function() {
                            $( this ).dialog( "close" );
                        }

                    }
                ],
                open: addTinyMCE,
                close: function() {
                    self.htmlText(tinyMCE.activeEditor.getContent());
                    self.questionText(self.htmlText());
                    removeTinyMCE();
                    $(this).dialog('destroy').remove();
                }
            });

        };
    } ,
    template:
        '<div class="panel-body" style="height: 100%; margin-top: -10px">\
                <div id="toolbar" class="ui-layout-content"></div>\
                <div>\
                    <span>Element Tag:</span>\
                    <br>\
                    <input style="max-width:50%;" type="text" data-bind="textInput: name"> \
                </div>\
                <br>\
                <div>\
                    <span>Question Text:</span>\
                    <br>\
                    <input style="max-width:50%;" type="text" data-bind="style: { display: !useRich() ? \'inline-block\' : \'none\' }, textInput: questionText"\
                    class="form-control">\
                    <input style="max-width:50%;" type="text" data-bind="style: { display: useRich() ? \'inline-block\' : \'none\' }"\
                    class="form-control", placeholder="Edit Rich Text" disabled>\
                    <span><a href="#" data-bind="click: edit"><img style="display: inline-block;" width="20" height="20"src="/resources/edit.png"/></a></span> \
               </div>\
                <div style="display: none" title="Edit Rich Text" id="dialog">\
                   <h2>Edit Rich Text</h2>\
                   <textarea id="myTextEditor" name="content" style="width:100%; height:100%"></textarea>\
                </div>\
                <br><br>\
        </div>'
});

ko.components.register('text-playerview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.answer = dataModel.answer;
        this.useRich = dataModel.useRich;
    },
    template:
        '<span  data-bind="if: useRich"><div style="font-size: 200%" data-bind="html: questionText"></div></span>\
         <span data-bind="ifnot: useRich"><div style="font-size: 200%" data-bind="text: questionText"></div></span>\
          <br>\
            <div>\
            <input style="position:relative;left: 0%; max-width:50%"\
                 type="text"\
                class="form-control"\
                placeholder="Participant Answer" data-bind="textInput: answer">\
          </div>\
          <br>'
});
