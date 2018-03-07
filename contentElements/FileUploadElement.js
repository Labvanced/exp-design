
var FileUploadElement = function(expData) {
    var self = this;
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "FileUploadElement";
    this.questionText = ko.observable(null); // EditableTextElement

    this.bgColorDefault = ko.observable('#99cc66');
    this.bgColorHover = ko.observable('#99de50');

    this.variable = ko.observable(null);
    this.isRequired = ko.observable(false);
    this.enableTitle= ko.observable(true);

    ///// not serialized
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    this.fileUploaded = ko.observable(null);
};

FileUploadElement.prototype.label = "File Upload";
FileUploadElement.prototype.iconPath = "/resources/icons/openFile.svg";
FileUploadElement.prototype.dataType =      [ ];
FileUploadElement.prototype.modifiableProp = [ ];
FileUploadElement.prototype.initWidth = 300;
FileUploadElement.prototype.initHeight = 100;

FileUploadElement.prototype.dispose = function() {
    this.questionText().dispose();
    this.variable().removeBackRef(this);
};

FileUploadElement.prototype.init = function(variableName) {

    this.questionText(new EditableTextElement(this.expData, this, '<p><span style="font-size:20px;">Your Question</span></p>'));
    this.questionText().init();

    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType('file');
    globalVar.scope('trial');
    globalVar.scale('nominal');
    globalVar.name(variableName);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();
};

FileUploadElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'File Upload');
};

FileUploadElement.prototype.enableHighlight = function(elem) {
    var self= this;
    $(elem).css({
        'backgroundColor': self.bgColorHover(),
        'cursor': 'pointer'

    });
};


FileUploadElement.prototype.disableHighlight = function(elem) {
    var self= this;
    $(elem).css({
        'backgroundColor': self.bgColorDefault(),
        'cursor': 'default'
    });
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
FileUploadElement.prototype.getAllModifiers = function(modifiersArr) {
    this.questionText().getAllModifiers(modifiersArr);
};

FileUploadElement.prototype.setPointers = function(entitiesArr) {
    var self = this;
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
        this.setVariableBackRef();
    }
    this.questionText().setPointers(entitiesArr);
};

FileUploadElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.questionText().reAddEntities(entitiesArr);
};

FileUploadElement.prototype.selectTrialType = function(selectionSpec) {
    this.questionText().selectTrialType(selectionSpec);
};

FileUploadElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    return textArr;
};


FileUploadElement.prototype.isInputValid = function() {
    this.triedToSubmit(true);
    if (this.isRequired()==false){
        this.dataIsValid(true);
        return true
    }
    else{
        if (this.fileUploaded()){
            this.dataIsValid(true);
            return true;
        }
        else{
            this.dataIsValid(false);
            return false;
        }
    }
};


FileUploadElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        variable: variableId,
        isRequired:this.isRequired(),
        enableTitle:this.enableTitle()
    };
};

FileUploadElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')) {
        this.questionText(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else{
        this.questionText(new EditableTextElement(this.expData, this, data.questionText));
    }
    this.variable(data.variable);
    if (data.hasOwnProperty('isRequired')) {
        this.isRequired(data.isRequired);
    }
    if(data.hasOwnProperty('enableTitle')){
        this.enableTitle(data.enableTitle);
    }
};


function createFileUploadElementComponents() {
    ko.components.register('fileupload-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.currentEntry = ko.observable('');
                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };

                    this.relinkCallback = function() {
                        var frameData = self.dataModel.parent.parent;
                        var variableDialog = new AddNewVariable(self.dataModel.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            self.dataModel.variable(newVariable);
                            self.dataModel.setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };
                };

                viewModel.prototype.addEntry = function() {
                    this.dataModel.addEntry(this.currentEntry());
                    this.currentEntry('');
                };
                viewModel.prototype.removeEntry = function(idx) {
                    this.dataModel.removeEntry(idx);
                };

                return new viewModel(dataModel);
            }

        },
        template: {element: 'fileupload-editview-template'}
    });


    ko.components.register('fileupload-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;

                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };

                    this.chooseFile = function() {
                        var fileUploadElem = $(componentInfo.element).find('.playerFileUploadInput')[0];
                        fileUploadElem.click();
                    }
                };

                return new viewModel(dataModel);
            }
        },
        template: { element: 'fileupload-preview-template' }
    });


    ko.components.register('fileupload-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){
                    this.dataModel = dataModel;

                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };

                    this.chooseFile = function() {
                        var fileUploadElem = $(componentInfo.element).find('.playerFileUploadInput')[0];
                        fileUploadElem.click();
                    }
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'fileupload-playerview-template'}
    });
}



