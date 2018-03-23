
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
    this.currentlyPlaying = ko.observable(false); // not serialized at the moment... maybe later?
    this.currentTimePercentage = ko.observable(0);
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    this.fileUploaded = ko.observable(false);
    this.recordedAudio = ko.observable(null);
    this.mediaRecorder = null;
    this.audioElem = null;
    this.audioRecElem = null;
    this.subscribersForJumpEvents = [];
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

AudioRecordingElement.prototype.switchPlayState = function() {
    this.currentlyPlaying(!this.currentlyPlaying());
};

AudioRecordingElement.prototype.jumpToByFraction = function(fraction) {
    console.log("jump to fraction "+fraction);
    for (var i =0; i<this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({jumpToFraction: fraction});
    }
};

AudioRecordingElement.prototype.jumpToByTime = function(time) {
    console.log("jump to time "+time);
    for (var i =0; i<this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({jumpToTime: time});
    }
};

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
                muted: true,
                src: URL.createObjectURL(stream)
            });
            //try {
            //    self.audioRecElem.srcObject = stream;
            //} catch (error) {
            //    self.audioRecElem.src = URL.createObjectURL(stream);
            //}
            self.audioRecElem.play();

            var audiosContainer = document.getElementById('audios-container');
            audiosContainer.appendChild(self.audioRecElem);

            self.mediaRecorder = new MediaStreamRecorder(stream);
            self.mediaRecorder.stream = stream;
            self.mediaRecorder.audioChannels = 1;
            self.mediaRecorder.ondataavailable = function (blob) {
                console.log("data available");
                //try {
                //    self.audioElem.srcObject = blob;
                //} catch (error) {
                    //self.audioElem.src = URL.createObjectURL(blob);
                //}


                var a = document.createElement('a');
                a.target = '_blank';
                a.innerHTML = 'Open Recorded Audio N';
                a.href = URL.createObjectURL(blob);
                audiosContainer.appendChild(a);

                console.log("mediaRecorder.mimeType = "+self.mediaRecorder.mimeType);

                //self.recordedAudio(blob);
                //document.write('<a href="' + blobURL + '">' + blobURL + '</a>');
            };
            self.mediaRecorder.start(5000);
        }

        function onMediaError(e) {
            console.error('media error', e);
        }

        captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
    }
    else if (actionType=="StopRecording") {
        console.log("StopRecording");
        self.mediaRecorder.stop();
        self.mediaRecorder.stream.stop();

        ConcatenateBlobs(self.mediaRecorder.blobs, self.mediaRecorder.blobs[0].type, function(concatenatedBlob) {
            var a = document.createElement('a');
            a.target = '_blank';
            a.innerHTML = 'Final Audio';
            a.href = URL.createObjectURL(concatenatedBlob);
            audiosContainer.appendChild(a);
        });

        //self.audioRecElem.src = "";
        //self.audioRecElem.srcObject = null;
        //var audiosContainer = document.getElementById('audios-container');
        // remove all children of audiosContainer:
        //while (audiosContainer.firstChild) {
        //    audiosContainer.removeChild(audiosContainer.firstChild);
        //}
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



    var AudioRecordingPreviewAndPlayerViewModel = function(dataModel, componentInfo){
        var self = this;
        this.element = componentInfo.element;
        this.dataModel = dataModel;

        // only add playback functionality if not in sequence view:
        if ($(this.element).parents('#sequenceView').length == 0) {

            var myAudio = $(this.element).find('audio')[0];
            var seekBar = $(this.element).find('.seek-bar')[0];

            seekBar.addEventListener("change", function () {
                dataModel.jumpToByFraction(seekBar.value / 100);
            });

            this.dataModel.currentlyPlaying.subscribe(function (value) {
                if (value) {
                    myAudio.play();
                }
                else {
                    myAudio.pause();
                }
            });

            // add subscriber to be notified when the audio should jump to specific time:
            this.listenForJumpTo = function (evtParam) {
                if (evtParam.jumpToFraction) {
                    var time = myAudio.duration * evtParam.jumpToFraction;
                    console.log("setting audio time to " + time);
                    myAudio.currentTime = 5;
                }
            };
            this.dataModel.subscribersForJumpEvents.push(this.listenForJumpTo);

            // this needs to be defined here, but the handle saved in the object so that we can remove it later in dispose:
            this.timeUpdateListener = function () {
                if (!isNaN(myAudio.duration)) {
                    var percentage = Math.floor(100 * myAudio.currentTime / myAudio.duration);
                    self.dataModel.currentTimePercentage(percentage);
                }
            };
            // Update the seek bar as the audio plays
            myAudio.addEventListener("timeupdate", this.timeUpdateListener);

            this.subscriberTimePercentage = this.dataModel.currentTimePercentage.subscribe(function (percentage) {
                seekBar.value = percentage;
            });
        }

        this.recordedAudioSubscriber = this.dataModel.recordedAudio.subscribe(function(blob) {
            var myAudioSrc = $(self.element).find('.recordedAudioPlaybackSource')[0];
            //try {
            //    myAudioSrc.srcObject = blob;
            //} catch (error) {
                myAudioSrc.src = URL.createObjectURL(blob);
            //}
            myAudio = $(myAudioSrc).parent()[0];
            myAudio.load();
        });

        this.focus = function () {
            this.dataModel.ckInstance.focus()
        };
    };
    AudioRecordingPreviewAndPlayerViewModel.prototype.afterRenderInit = function(elem) {
        this.dataModel.audioElem = elem;
    };
    AudioRecordingPreviewAndPlayerViewModel.prototype.dispose = function() {
        console.log("disposing AudioRecordingPreviewAndPlayerViewModel");
        // remove subscriber to be notified when the audio should jump to specific time:
        var index = this.dataModel.subscribersForJumpEvents.indexOf(this.listenForJumpTo);
        if (index > -1) {
            this.dataModel.subscribersForJumpEvents.splice(index, 1);
        }
        if (this.subscriberTimePercentage) {
            this.subscriberTimePercentage.dispose();
        }
        if (this.recordedAudioSubscriber) {
            this.recordedAudioSubscriber.dispose();
        }
        var myAudio = $(this.element).find('audio')[0];

        myAudio.removeEventListener("timeupdate", this.timeUpdateListener);
    };
    
    ko.components.register('audiorecording-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                return new AudioRecordingPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'audiorecording-preview-template' }
    });


    ko.components.register('audiorecording-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                return new AudioRecordingPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: {element: 'audiorecording-playerview-template'}
    });
}



