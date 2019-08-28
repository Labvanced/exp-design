
var AudioRecordingElement = function(expData) {
    var self = this;
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "AudioRecordingElement";
    this.questionText = ko.observable(null); // EditableTextElement
    this.showRecordingButton = ko.observable(true);
    this.showPlayButton = ko.observable(true);
    this.showUploadButton = ko.observable(true);
    this.showSeekbar = ko.observable(true);
    this.variable = ko.observable(null);
    this.isRequired = ko.observable(false);
    this.enableTitle = ko.observable(true);

    ///// not serialized
    this.currentlyPlaying = ko.observable(false); // not serialized at the moment... maybe later?
    this.currentlyRecording = ko.observable(false);
    this.currentTimePercentage = ko.observable(0);
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    this.fileUploaded = ko.observable(false);
    this.recordedAudio = ko.observable(null);
    this.subscribersForJumpEvents = [];

    this.use_mp3_recorder = true;
    this.recorder = null;
    this.mp3Recorder = null;

};

AudioRecordingElement.prototype.label = "Audio Recording";
AudioRecordingElement.prototype.iconPath = "/resources/icons/microphone.svg";
AudioRecordingElement.prototype.dataType =      [ ];
AudioRecordingElement.prototype.modifiableProp = [ ];
AudioRecordingElement.prototype.initWidth = 300;
AudioRecordingElement.prototype.initHeight = 100;
AudioRecordingElement.prototype.numVarNamesRequired = 1;
AudioRecordingElement.prototype.actionTypes = ["StartRecording","StopRecording","StartUpload","ClearRecording","StartPlayback","StopPlayback"];
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
    if (this.variable() instanceof GlobalVar) {
        this.variable().removeBackRef(this);
    }

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
    globalVar.isObjectVar(true);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();

    this.enableAudioRecDialog();
};

AudioRecordingElement.prototype.enableAudioRecDialog = function() {
     var self = this;
     if (!(this.expData.studySettings.isAudioRecEnabled())){
         $('<div />').html('You have just added an Audio-Recording-Element, but audio recordings are still disabled in the overall experiment settings. Please note, that this will limit browser support of your experiment to Chrome, Firefox, MS Edge, and Safari. Do you want to enable audio recordings now in the experiment settings?').dialog({
             modal: true,
             buttons: [
                 {text: "Enable Audio",
                     click: function() {
                         self.expData.studySettings.enableAudioRec();
                         $(this).dialog( "close" );
                     }},
                 {text: "Keep Disabled",
                     click: function() {
                         $( this ).dialog( "close" );
                     }}
             ]
         });
     }
};

AudioRecordingElement.prototype.setVariableBackRef = function() {
    if (this.variable() instanceof GlobalVar) {
        this.variable().addBackRef(this, this.parent, true, true, 'Audio Recording');
    }
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

AudioRecordingElement.prototype.getTriggerTypes = function() {
    return AudioRecordingElement.prototype.triggerTypes;
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
                $(self.parent).trigger("UploadComplete");
            }

            //var fileOfBlob = new File([this.recordedAudio()], newFileName+'.webm');
            player.playerFileUploader.addToAjaxUploadQueue(this.recordedAudio(), newFileName, this.variable(), callbackWhenFinished);
        }

    }
    else if (actionType=="StartRecording") {
        console.log("StartRecording");

        if (player.microphone_stream) {

            if (!this.currentlyRecording() && !this.currentlyPlaying()) {
                this.currentlyRecording(true);
                if (this.use_mp3_recorder) {
                    this.mp3Recorder = new MP3Recorder({
                        bitRate: 128
                    }, player.audioContext);
                    this.mp3Recorder.beginRecording(player.microphone_stream);
                }
                else {
                    self.recorder = new MediaRecorder(player.microphone_stream);

                    // Set record to <audio> when recording will be finished
                    self.recorder.addEventListener('dataavailable', function (e) {
                        console.log("data available");
                        var blob = e.data;
                        self.recordedAudio(blob);
                    });

                    // Start recording
                    self.recorder.start()
                }

            }

        }

    }
    else if (actionType=="StopRecording") {
        console.log("StopRecording");

        // Stop recording
        if (this.currentlyRecording()) {
            this.currentlyRecording(false);
            if (this.use_mp3_recorder) {
                this.mp3Recorder.stop();
                this.mp3Recorder.getMp3Blob(function (blob) {
                    console.log("got mp3 blob");
                    self.recordedAudio(blob);
                    $(self.parent).trigger("AudioRecordingFinished");
                }, function (e) {
                    alert('We could not retrieve your message');
                    console.log(e);
                });
            }
            else {
                if (self.recorder) {
                    if (self.recorder.state == "recording") {
                        self.recorder.stop();
                        $(self.parent).trigger("AudioRecordingFinished");
                    }
                }
            }
        }

    }
    else if (actionType=="ClearRecording") {
        console.log("ClearRecording");
        if (this.currentlyPlaying()) {
            this.currentlyPlaying(false);
        }
        this.recordedAudio(null);
    }
    else if (actionType=="StartPlayback") {
        console.log("StartPlayback");
        if (!this.currentlyRecording() && !this.currentlyPlaying()) {
            this.currentlyPlaying(true);
        }
    }
    else if (actionType=="StopPlayback") {
        console.log("StopPlayback");
        if (this.currentlyPlaying()) {
            this.currentlyPlaying(false);
        }
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
    if (this.variable() instanceof GlobalVar) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
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
        showRecordingButton: this.showRecordingButton(),
        showPlayButton: this.showPlayButton(),
        showUploadButton: this.showUploadButton(),
        showSeekbar: this.showSeekbar(),
        enableTitle: this.enableTitle()
    };
};

AudioRecordingElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;

    this.showRecordingButton(data.showRecordingButton);
    this.showPlayButton(data.showPlayButton);
    this.showUploadButton(data.showUploadButton);
    this.showSeekbar(data.showSeekbar);

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

                    this.relinkCallback = function() {
                        var frameData = self.dataModel.parent.parent;
                        var variableDialog = new AddNewVariable(self.dataModel.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            if (self.dataModel.variable()){
                                self.dataModel.variable().removeBackRef( self.dataModel);
                            }
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

        this.myAudioElem = null; // will be set in the afterRender function...

        // only add playback functionality if not in sequence view:
        if ($(this.element).parents('#sequenceView').length == 0) {
            this.dataModel.currentlyPlaying.subscribe(function (value) {
                if (value) {
                    self.myAudioElem.play();
                }
                else {
                    self.myAudioElem.pause();
                }
            });

            // add subscriber to be notified when the audio should jump to specific time:
            this.listenForJumpTo = function (evtParam) {
                if (evtParam.jumpToFraction) {
                    var time = self.myAudioElem.duration * evtParam.jumpToFraction;
                    console.log("setting audio time to " + time);
                    self.myAudioElem.currentTime = time;
                }
            };
            this.dataModel.subscribersForJumpEvents.push(this.listenForJumpTo);

            // this needs to be defined here, but the handle saved in the object so that we can remove it later in dispose:
            this.timeUpdateListener = function () {
                if (!isNaN(self.myAudioElem.duration)) {
                    var percentage = Math.floor(100 * self.myAudioElem.currentTime / self.myAudioElem.duration);
                    self.dataModel.currentTimePercentage(percentage);
                }
            };

            // this needs to be defined here, but the handle saved in the object so that we can remove it later in dispose:
            this.onPlaybackEnded = function () {
                self.dataModel.currentlyPlaying(false);
                self.dataModel.currentTimePercentage(0);
            };

            this.subscriberTimePercentage = this.dataModel.currentTimePercentage.subscribe(function (percentage) {
                self.seekBar.value = percentage;
            });
        }

        this.recordedAudioSubscriber = this.dataModel.recordedAudio.subscribe(function(blob) {
            try {
                self.myAudioElem.srcObject = blob;
            } catch (error) {
                self.myAudioElem.src = URL.createObjectURL(blob);
            }
            self.myAudioElem.load();
        });
    };
    AudioRecordingPreviewAndPlayerViewModel.prototype.afterRenderInit = function(elem) {
        var self = this;

        this.myAudioElem = $(elem).find(".recordedAudioPlaybackElem")[0];
        this.seekBar = $(elem).find('.seek-bar')[0];

        if (this.seekBar){
            $(this.seekBar).on("change", function () {
                self.dataModel.jumpToByFraction(self.seekBar.value / 100);
            });

        }

        // Update the seek bar as the audio plays
        this.myAudioElem.addEventListener("timeupdate", this.timeUpdateListener);
        this.myAudioElem.addEventListener("ended", this.onPlaybackEnded);
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
        myAudio.removeEventListener("ended", this.onPlaybackEnded);
        $(this.seekBar).off("change")
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


(function (exports) {

    var MP3Recorder = function (config, audioContext) {

        var recorder = this;

        config = config || {};

        var context;
        if (audioContext) {
            context = audioContext;
        }
        else {
            context = new AudioContext();
        }

        var realTimeWorker = new Worker('/assets/js/worker-realtime.js');

        // Initializes LAME so that we can record.
        this.initialize = function () {
            config.sampleRate = context.sampleRate;
            realTimeWorker.postMessage({cmd: 'init', config: config});
        };


        // This function finalizes LAME output and saves the MP3 data to a file.
        var microphone, processor;
        // Function that handles getting audio out of the browser's media API.
        this.beginRecording = function(stream) {
            // Set up Web Audio API to process data from the media stream (microphone).
            microphone = context.createMediaStreamSource(stream);
            // Settings a bufferSize of 0 instructs the browser to choose the best bufferSize
            processor = context.createScriptProcessor(0, 1, 1);
            // Add all buffers from LAME into an array.
            processor.onaudioprocess = function (event) {
                // Send microphone data to LAME for MP3 encoding while recording.
                var array = event.inputBuffer.getChannelData(0);
                //console.log('Buffer Received', array);
                realTimeWorker.postMessage({cmd: 'encode', buf: array})
            };
            // Begin retrieving microphone data.
            microphone.connect(processor);
            processor.connect(context.destination);
            // Return a function which will stop recording and return all MP3 data.
        };

        this.stop = function () {
            if (processor && microphone) {
                // Clean up the Web Audio API resources.
                microphone.disconnect();
                processor.disconnect();
                processor.onaudioprocess = null;
                // Return the buffers array. Note that there may be more buffers pending here.
            }
        };

        var mp3ReceiveSuccess, currentErrorCallback;
        this.getMp3Blob = function (onSuccess, onError) {
            currentErrorCallback = onError;
            mp3ReceiveSuccess = onSuccess;
            realTimeWorker.postMessage({cmd: 'finish'});
        };

        realTimeWorker.onmessage = function (e) {
            switch (e.data.cmd) {
                case 'end':
                    if (mp3ReceiveSuccess) {
                        mp3ReceiveSuccess(new Blob(e.data.buf, {type: 'audio/mp3'}));
                    }
                    console.log('MP3 data size', e.data.buf.length);
                    break;
                case 'error':
                    if (currentErrorCallback) {
                        currentErrorCallback(e.data.error);
                    }
                    break;
                default :
                    console.log('I just received a message I know not how to handle.', e.data);
            }
        };
        this.initialize();
    };

    exports.MP3Recorder = MP3Recorder;
})(window);
