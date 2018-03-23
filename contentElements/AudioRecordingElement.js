
var AudioRecordingElement = function(expData) {
    var self = this;
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "AudioRecordingElement";
    this.questionText = ko.observable(null); // EditableTextElement

    this.showMediaControls = ko.observable(true);

    this.variable = ko.observable(null);
    this.isRequired = ko.observable(false);
    this.enableTitle = ko.observable(true);

    ///// not serialized
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    this.fileUploaded = ko.observable(false);
    this.recordedAudio = ko.observable(null);
    this.mediaRecorder = null;
    this.audioElem = null;
    this.audioRecElem = null;
};

AudioRecordingElement.prototype.label = "Audio Recording";
AudioRecordingElement.prototype.iconPath = "/resources/icons/tools/tool_audio.svg";
AudioRecordingElement.prototype.dataType =      [ ];
AudioRecordingElement.prototype.modifiableProp = [ ];
AudioRecordingElement.prototype.initWidth = 300;
AudioRecordingElement.prototype.initHeight = 100;
AudioRecordingElement.prototype.numVarNamesRequired = 1;
AudioRecordingElement.prototype.actionTypes = ["StartRecording","StopRecording","StartUpload","ClearRecording"];
AudioRecordingElement.prototype.triggerTypes = ["AudioRecordingFinished","UploadComplete"];

AudioRecordingElement.prototype.dispose = function() {
    this.questionText().dispose();
    this.variable().removeBackRef(this);
};

AudioRecordingElement.prototype.init = function(variableName) {

    this.questionText(new EditableTextElement(this.expData, this, '<p><span style="font-size:20px;">Your Question</span></p>'));
    this.questionText().init();

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
    this.variable().addBackRef(this, this.parent, true, true, 'Audio Recording');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
AudioRecordingElement.prototype.getAllModifiers = function(modifiersArr) {
    this.questionText().getAllModifiers(modifiersArr);
};

AudioRecordingElement.prototype.getActionTypes = function() {
    return AudioRecordingElement.prototype.actionTypes;
};

AudioRecordingElement.prototype.executeAction = function(actionType) {
    var self = this;
    if (actionType=="StartUpload") {
        var file = this.recordedAudio();
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

            var extension = "webm";
            var newFileName = "blockNr_" + blockNr + "_taskNr_" + taskNr + "_trialNr_" + trialNr + "_" + elemName + "." + extension;

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
                        self.variable().value().setValue(file_name);
                    }
                }
            }

            //var fileOfBlob = new File([this.recordedAudio()], newFileName+'.webm');
            player.playerFileUploader.addToAjaxUploadQueue(this.recordedAudio(), newFileName, this.variable(), callbackWhenFinished);
        }

    }
    else if (actionType=="StartRecording") {
        console.log("StartRecording");

        function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
            navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
        }

        var mediaConstraints = {
            audio: true
        };

        function onMediaSuccess(stream) {
            self.audioRecElem = document.createElement('audio');

            self.audioRecElem = mergeProps(self.audioRecElem, {
                controls: true,
                muted: true
            });
            try {
                self.audioRecElem.srcObject = stream;
            } catch (error) {
                self.audioRecElem.src = URL.createObjectURL(stream);
            }
            self.audioRecElem.play();

            var audiosContainer = document.getElementById('audios-container');
            audiosContainer.appendChild(self.audioRecElem);

            self.mediaRecorder = new MediaStreamRecorder(stream);
            self.mediaRecorder.stream = stream;
            self.mediaRecorder.ondataavailable = function (blob) {
                console.log("data available");
                try {
                    self.audioElem.srcObject = blob;
                } catch (error) {
                    self.audioElem.src = URL.createObjectURL(blob);
                }

                console.log("mediaRecorder.mimeType = "+self.mediaRecorder.mimeType);

                self.recordedAudio(blob);
                //document.write('<a href="' + blobURL + '">' + blobURL + '</a>');
            };
            self.mediaRecorder.start(3000);
        }

        function onMediaError(e) {
            console.error('media error', e);
        }

        captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
    }
    else if (actionType=="StopRecording") {
        console.log("StopRecording");
        self.mediaRecorder.stop();
        self.audioRecElem.src = "";
        self.audioRecElem.srcObject = null;
        var audiosContainer = document.getElementById('audios-container');
        // remove all children of audiosContainer:
        while (audiosContainer.firstChild) {
            audiosContainer.removeChild(audiosContainer.firstChild);
        }
    }
    else if (actionType=="ClearRecording") {
        console.log("ClearRecording");
        this.recordedAudio(null);
    }
};

AudioRecordingElement.prototype.setPointers = function(entitiesArr) {
    var self = this;
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
        this.setVariableBackRef();
    }
    this.questionText().setPointers(entitiesArr);
};

AudioRecordingElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.questionText().reAddEntities(entitiesArr);
};

AudioRecordingElement.prototype.selectTrialType = function(selectionSpec) {
    this.questionText().selectTrialType(selectionSpec);
};

AudioRecordingElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
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
        showMediaControls: this.showMediaControls(),
        enableTitle: this.enableTitle()
    };
};

AudioRecordingElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    this.showMediaControls(data.showMediaControls);
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


function createAudioRecordingComponents() {
    ko.components.register('audiorecording-editview', {
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
                };

                viewModel.prototype.afterRenderInit = function(elem) {
                    this.dataModel.audioElem = elem;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'audiorecording-playerview-template'}
    });
}



