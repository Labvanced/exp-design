
var AudioRecordingElement = function(expData) {
    var self = this;
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "AudioRecordingElement";
    this.questionText = ko.observable(null); // EditableTextElement
    this.buttonText = ko.observable(null);

    this.bgColorDefault = ko.observable('#99cc66');
    this.bgColorHover = ko.observable('#99de50');

    this.variable = ko.observable(null);
    this.isRequired = ko.observable(false);
    this.enableTitle = ko.observable(true);

    ///// not serialized
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    this.fileUploaded = ko.observable(false);
    this.selectedFile = ko.observable(null);
};

AudioRecordingElement.prototype.label = "File Upload";
AudioRecordingElement.prototype.iconPath = "/resources/icons/openFile.svg";
AudioRecordingElement.prototype.dataType =      [ ];
AudioRecordingElement.prototype.modifiableProp = [ ];
AudioRecordingElement.prototype.initWidth = 300;
AudioRecordingElement.prototype.initHeight = 100;
AudioRecordingElement.prototype.numVarNamesRequired = 1;
AudioRecordingElement.prototype.actionTypes = ["StartUpload","ClearFile"];
AudioRecordingElement.prototype.triggerTypes = ["FileSelected","UploadComplete"];

AudioRecordingElement.prototype.dispose = function() {
    this.questionText().dispose();
    this.buttonText().dispose();
    this.variable().removeBackRef(this);
};

AudioRecordingElement.prototype.init = function(variableName) {

    this.questionText(new EditableTextElement(this.expData, this, '<p><span style="font-size:20px;">Your Question</span></p>'));
    this.questionText().init();

    this.buttonText(new EditableTextElement(this.expData, this, '<p><span style="text-align: center;">Choose File</span></p>'));
    this.buttonText().init();

    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType('file');
    globalVar.scope('trial');
    globalVar.scale('nominal');
    globalVar.name(variableName);
    globalVar.resetAtTrialStart(true);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();
};

AudioRecordingElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'File Upload');
};

AudioRecordingElement.prototype.enableHighlight = function(elem) {
    var self= this;
    $(elem).css({
        'backgroundColor': self.bgColorHover(),
        'cursor': 'pointer'
    });
};

AudioRecordingElement.prototype.initColorPicker = function() {

    var self = this;
    $("#bgColorPickerDefault").spectrum({
        color: self.bgColorDefault(),
        preferredFormat: "hex",
        showInput: true,
        change: function (color) {
            var colorStr = color.toHexString();
            self.bgColorDefault(colorStr);

        }
    });
    if (this.bg1Subsciption) {
        this.bg1Subsciption.dispose();
    }
    this.bg1Subsciption = this.bgColorDefault.subscribe(function(val){
        $("#bgColorPickerDefault").spectrum("set", val);
    });


    $("#bgColorPickerHover").spectrum({
        color: self.bgColorHover(),
        preferredFormat: "hex",
        showInput: true,
        change: function (color) {
            var colorStr = color.toHexString();
            self.bgColorHover(colorStr);

        }
    });

    if (this.bg2Subsciption) {
        this.bg2Subsciption.dispose();
    }
    this.bg2Subsciption = this.bgColorHover.subscribe(function(val){
        $("#bgColorPickerHover").spectrum("set", val);
    });

};

AudioRecordingElement.prototype.disableHighlight = function(elem) {
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
AudioRecordingElement.prototype.getAllModifiers = function(modifiersArr) {
    this.questionText().getAllModifiers(modifiersArr);
    this.buttonText().getAllModifiers(modifiersArr);
};

AudioRecordingElement.prototype.getActionTypes = function() {
    return AudioRecordingElement.prototype.actionTypes;
};

AudioRecordingElement.prototype.executeAction = function(actionType) {
    var self = this;
    if (actionType=="StartUpload") {
        var file = this.selectedFile();
        if (file) {
            console.log("StartUpload");
            var blockNr = player.currentBlockIdx + 1;
            var taskNr = player.currentTaskIdx + 1;
            var trialNr = player.trialIter;
            var elemName = this.parent.name();

            if (file.size > 10000000) {
                console.log("file too large. cannot upload");
                return;
            }

            var newFileName = "blockNr_" + blockNr + "_taskNr_" + taskNr + "_trialNr_" + trialNr + "_" + elemName;

            function callbackWhenFinished(file_guid, file_name) {
                console.log("upload finished");
                self.fileUploaded(true);
                if (self.variable()) {
                    if (self.variable().value() instanceof GlobalVarValueFile) {
                        self.variable().value().setValue({
                            name: file_name,
                            guid: file_guid
                        });
                    }
                    else {
                        self.variable().value().setValue(newFileName);
                    }
                }
            }
        }
        player.playerFileUploader.addToAjaxUploadQueue(this.selectedFile(), newFileName, this.variable(), callbackWhenFinished);
    }
    else if (actionType=="ClearFile") {
        console.log("ClearFile");
        this.selectedFile(null);
    }
};

AudioRecordingElement.prototype.setPointers = function(entitiesArr) {
    var self = this;
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
        this.setVariableBackRef();
    }
    this.questionText().setPointers(entitiesArr);
    this.buttonText().setPointers(entitiesArr);
};

AudioRecordingElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.questionText().reAddEntities(entitiesArr);
    this.buttonText().reAddEntities(entitiesArr);
};

AudioRecordingElement.prototype.selectTrialType = function(selectionSpec) {
    this.questionText().selectTrialType(selectionSpec);
    this.buttonText().selectTrialType(selectionSpec);
};

AudioRecordingElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    this.buttonText().getTextRefs(textArr, questlabel);
    return textArr;
};


AudioRecordingElement.prototype.isInputValid = function() {
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


AudioRecordingElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        variable: variableId,
        isRequired:this.isRequired(),
        bgColorDefault: this.bgColorDefault(),
        bgColorHover: this.bgColorHover(),
        enableTitle: this.enableTitle(),
        buttonText: this.buttonText().toJS()
    };
};

AudioRecordingElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')) {
        this.questionText(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else{
        this.questionText(new EditableTextElement(this.expData, this, data.questionText));
    }
    if(data.buttonText.hasOwnProperty('rawText')) {
        this.buttonText(new EditableTextElement(this.expData, this, ''));
        this.buttonText().fromJS(data.buttonText);
    }
    else{
        this.buttonText(new EditableTextElement(this.expData, this, data.buttonText));
    }
    this.variable(data.variable);
    if (data.hasOwnProperty('isRequired')) {
        this.isRequired(data.isRequired);
    }
    if(data.hasOwnProperty('enableTitle')){
        this.enableTitle(data.enableTitle);
    }
    if (data.hasOwnProperty('bgColorDefault')) {
        this.bgColorDefault(data.bgColorDefault);
        this.bgColorHover(data.bgColorHover);
    }
};


function createAudioRecordingComponents() {
    ko.components.register('audiorecording-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.dataModel.initColorPicker();
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
        template: {element: 'audiorecording-editview-template'}
    });


    ko.components.register('audiorecording-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };
                };

                return new viewModel(dataModel);
            }
        },
        template: { element: 'audiorecording-preview-template' }
    });


    ko.components.register('audiorecording-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;

                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };

                    this.chooseFile = function() {
                        var fileUploadElem = $(componentInfo.element).find('.playerFileUploadInput')[0];
                        fileUploadElem.click();
                    };

                    this.fileSelected = function(file) {
                        self.dataModel.selectedFile(file);
                    };
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'audiorecording-playerview-template'}
    });
}



