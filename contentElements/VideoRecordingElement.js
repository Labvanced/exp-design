
var VideoRecordingElement = function (expData) {
    var self = this;
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "VideoRecordingElement";
    this.questionText = ko.observable(null); // EditableTextElement
    this.showRecordingButton = ko.observable(true);
    this.showPlayButton = ko.observable(true);
    this.showUploadButton = ko.observable(true);
    this.showSeekbar = ko.observable(true);
    this.showRecordedVideo = ko.observable(true);
    this.showLiveVideo = ko.observable(true);
    this.variable = ko.observable(null);
    this.isRequired = ko.observable(false);
    this.enableTitle = ko.observable(false);

    ///// not serialized
    this.currentlyPlaying = ko.observable(false); // not serialized at the moment... maybe later?
    this.currentlyRecording = ko.observable(false);
    this.playbackMode = ko.observable("off"); // or live or replayRec
    this.currentTimePercentage = ko.observable(0);
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    this.fileUploaded = ko.observable(false);
    this.recordedVideo = ko.observable(null);
    this.subscribersForJumpEvents = [];

    this.recorder = null;

};

VideoRecordingElement.prototype.label = "Video Recording";
VideoRecordingElement.prototype.iconPath = "/resources/icons/microphone.svg";
VideoRecordingElement.prototype.dataType = [];
VideoRecordingElement.prototype.modifiableProp = [];
VideoRecordingElement.prototype.displayNames = [];
VideoRecordingElement.prototype.initWidth = 250;
VideoRecordingElement.prototype.initHeight = 220;
VideoRecordingElement.prototype.numVarNamesRequired = 1;
VideoRecordingElement.prototype.actionTypes = ["StartRecording", "StopRecording", "StartUpload", "ClearRecording", "StartPlayback", "StopPlayback"];
VideoRecordingElement.prototype.triggerTypes = ["VideoRecordingFinished", "UploadComplete"];

VideoRecordingElement.prototype.switchPlayState = function () {
    this.currentlyPlaying(!this.currentlyPlaying());
};

VideoRecordingElement.prototype.jumpToByFraction = function (fraction) {
    console.log("jump to fraction " + fraction);
    for (var i = 0; i < this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({ jumpToFraction: fraction });
    }
};

VideoRecordingElement.prototype.jumpToByTime = function (time) {
    console.log("jump to time " + time);
    for (var i = 0; i < this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({ jumpToTime: time });
    }
};

VideoRecordingElement.prototype.dispose = function () {
    this.questionText().dispose();
    if (this.variable() instanceof GlobalVar) {
        this.variable().removeBackRef(this);
    }

};

VideoRecordingElement.prototype.init = function (variableName) {

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

    this.enableVideoRecDialog();
};

VideoRecordingElement.prototype.enableVideoRecDialog = function () {
    var self = this;
    if (!(this.expData.studySettings.isVideoRecEnabled())) {
        $('<div />').html('You have just added an Video-Recording-Element, but video recordings are still disabled in the overall experiment settings. Please note, that this will limit browser support of your experiment to Chrome, Firefox, MS Edge, and Safari. Do you want to enable video recordings now in the experiment settings?').dialog({
            modal: true,
            buttons: [
                {
                    text: "Enable Video",
                    click: function () {
                        self.expData.studySettings.enableVideoRec();
                        $(this).dialog("close");
                    }
                },
                {
                    text: "Keep Disabled",
                    click: function () {
                        $(this).dialog("close");
                    }
                }
            ]
        });
    }
};

VideoRecordingElement.prototype.setVariableBackRef = function () {
    if (this.variable() instanceof GlobalVar) {
        this.variable().addBackRef(this, this.parent, true, true, 'Video Recording');
    }
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
VideoRecordingElement.prototype.getAllModifiers = function (modifiersArr) {
    this.questionText().getAllModifiers(modifiersArr);
};

VideoRecordingElement.prototype.getActionTypes = function () {
    return VideoRecordingElement.prototype.actionTypes;
};

VideoRecordingElement.prototype.getTriggerTypes = function () {
    return VideoRecordingElement.prototype.triggerTypes;
};

VideoRecordingElement.prototype.executeAction = function (actionType) {
    var self = this;
    if (actionType == "StartUpload") {
        var file = this.recordedVideo();
        if (file) {
            console.log("StartUpload");
            var blockNr = player.currentBlockIdx + 1;
            var taskNr = player.currentTaskIdx + 1;
            var trialNr = player.trialIter;
            var elemName = this.parent.name();

            if (file.size > 1024 * 1024 * 100) {
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

            //var fileOfBlob = new File([this.recordedVideo()], newFileName+'.webm');
            player.playerFileUploader.addToAjaxUploadQueue(this.recordedVideo(), newFileName, this.variable(), callbackWhenFinished);
        }

    }
    else if (actionType == "StartRecording") {
        console.log("StartRecording");

        if (player.video_stream) {

            if (!this.currentlyRecording()) {
                this.currentlyRecording(true);
                var browser = this.expData.varBrowserSpec().value().value();
                var specs = "";
                if (browser.indexOf("Chrome") >= 0 || browser.indexOf("Opera") >= 0 || browser.indexOf("Edge") >= 0) {
                    specs = "video/webm; codecs=vp9";
                } else if (browser.indexOf("Firefox") >= 0) {
                    specs = "video/webm; codecs=h264";
                } else {
                    specs = "video/webm; codecs=vp8";
                }
                self.recorder = RecordRTC(player.video_stream, {
                    type: 'video',
                    mimeType: specs,
                    bitsPerSecond: 512000,
                    audioBitsPerSecond: 512000,
                    videoBitsPerSecond: 512000,
                });
                // Start recording
                self.recorder.startRecording();
            }

        }

    }
    else if (actionType == "StopRecording") {
        console.log("StopRecording");

        // Stop recording
        if (this.currentlyRecording()) {
            this.currentlyRecording(false);
            if (self.recorder) {
                if (self.recorder.state == "recording") {
                    self.recorder.stopRecording(function (blobURL) {
                        getSeekableBlob(self.recorder.getBlob(), function (seekableBlob) {
                            self.recordedVideo(seekableBlob);
                            $(self.parent).trigger("VideoRecordingFinished");
                        });
                    });
                }
            }
        }

    }
    else if (actionType == "ClearRecording") {
        console.log("ClearRecording");
        this.recordedVideo(null);
    }
    else if (actionType == "StartPlayback") {
        console.log("StartPlayback");
        if (this.playbackMode() == "replayRec") {
            if (!this.currentlyPlaying()) {
                this.currentlyPlaying(true);
            }
        }
    }
    else if (actionType == "StopPlayback") {
        console.log("StopPlayback");
        if (this.playbackMode() == "replayRec") {
            if (this.currentlyPlaying()) {
                this.currentlyPlaying(false);
            }
        }
    }
};

VideoRecordingElement.prototype.setPointers = function (entitiesArr) {
    var self = this;
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
        this.setVariableBackRef();
    }
    this.questionText().setPointers(entitiesArr);
};

VideoRecordingElement.prototype.reAddEntities = function (entitiesArr) {
    if (this.variable() instanceof GlobalVar) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }

    this.questionText().reAddEntities(entitiesArr);
};

VideoRecordingElement.prototype.selectTrialType = function (selectionSpec) {
    this.questionText().selectTrialType(selectionSpec);
};

VideoRecordingElement.prototype.getTextRefs = function (textArr, label) {
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    return textArr;
};


VideoRecordingElement.prototype.isInputValid = function () {
    this.triedToSubmit(true);
    if (this.isRequired() == false) {
        this.dataIsValid(true);
        return true
    }
    else {
        if (this.fileUploaded()) {
            this.dataIsValid(true);
            return true;
        }
        else {
            this.dataIsValid(false);
            return false;
        }
    }
};


VideoRecordingElement.prototype.toJS = function () {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        variable: variableId,
        isRequired: this.isRequired(),
        showRecordingButton: this.showRecordingButton(),
        showPlayButton: this.showPlayButton(),
        showUploadButton: this.showUploadButton(),
        showSeekbar: this.showSeekbar(),
        enableTitle: this.enableTitle(),
        showRecordedVideo: this.showRecordedVideo(),
        showLiveVideo: this.showLiveVideo()
    };
};

VideoRecordingElement.prototype.fromJS = function (data) {
    var self = this;
    this.type = data.type;

    this.showRecordingButton(data.showRecordingButton);
    this.showPlayButton(data.showPlayButton);
    this.showUploadButton(data.showUploadButton);
    this.showSeekbar(data.showSeekbar);
    this.showRecordedVideo(data.showRecordedVideo);
    this.showLiveVideo(data.showLiveVideo);

    if (data.questionText.hasOwnProperty('rawText')) {
        this.questionText(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else {
        this.questionText(new EditableTextElement(this.expData, this, data.questionText));
    }
    this.variable(data.variable);
    if (data.hasOwnProperty('isRequired')) {
        this.isRequired(data.isRequired);
    }
    if (data.hasOwnProperty('enableTitle')) {
        this.enableTitle(data.enableTitle);
    }


};


function createVideoRecordingComponents() {
    ko.components.register('videorecording-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {
                    var self = this;
                    this.dataModel = dataModel;
                    this.currentEntry = ko.observable('');

                    this.relinkCallback = function () {
                        var frameData = self.dataModel.parent.parent;
                        var variableDialog = new AddNewVariable(self.dataModel.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            if (self.dataModel.variable()) {
                                self.dataModel.variable().removeBackRef(self.dataModel);
                            }
                            self.dataModel.variable(newVariable);
                            self.dataModel.setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };
                };

                viewModel.prototype.addEntry = function () {
                    this.dataModel.addEntry(this.currentEntry());
                    this.currentEntry('');
                };
                viewModel.prototype.removeEntry = function (idx) {
                    this.dataModel.removeEntry(idx);
                };

                return new viewModel(dataModel);
            }

        },
        template: { element: 'videorecording-editview-template' }
    });



    var VideoRecordingPreviewAndPlayerViewModel = function (dataModel, componentInfo) {
        var self = this;
        this.element = componentInfo.element;
        this.dataModel = dataModel;

        this.myVideoElem = null; // will be set in the afterRender function...

        // only add playback functionality if not in sequence view:
        if ($(this.element).parents('#sequenceView').length == 0) {
            this.dataModel.currentlyPlaying.subscribe(function (value) {
                if (self.myVideoElem) {
                    if (self.dataModel.playbackMode() == "replayRec") {
                        if (value) {
                            self.myVideoElem.play();
                        }
                        else {
                            self.myVideoElem.pause();
                        }
                    }
                }
            });

            // add subscriber to be notified when the video should jump to specific time:
            this.listenForJumpTo = function (evtParam) {
                if (self.myVideoElem) {
                    if (evtParam.jumpToFraction) {
                        var time = self.myVideoElem.duration * evtParam.jumpToFraction;
                        console.log("setting video time to " + time);
                        self.myVideoElem.currentTime = time;
                    }
                }
            };
            this.dataModel.subscribersForJumpEvents.push(this.listenForJumpTo);

            // this needs to be defined here, but the handle saved in the object so that we can remove it later in dispose:
            this.timeUpdateListener = function () {
                if (self.myVideoElem) {
                    if (!isNaN(self.myVideoElem.duration)) {
                        var percentage = Math.floor(100 * self.myVideoElem.currentTime / self.myVideoElem.duration);
                        self.dataModel.currentTimePercentage(percentage);
                    }
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

        this.currentlyRecordingSubscriber = this.dataModel.currentlyRecording.subscribe(function (newVal) {
            if (newVal) {
                // WARNING: only call this when recording starts, because there is browser issue otherwise if video.srcObject is changed in same event loop call
                self.updateVideoSrc();
            }
        });
        this.recordedVideoSubscriber = this.dataModel.recordedVideo.subscribe(function () {
            self.updateVideoSrc();
        });

    };
    VideoRecordingPreviewAndPlayerViewModel.prototype.updateVideoSrc = function () {
        var self = this;
        if (this.myVideoElem) {
            var srcObject = null;
            var showLive = false;
            var showRecording = false;
            if (this.dataModel.showLiveVideo() && this.dataModel.currentlyRecording()) {
                showLive = true;
            }
            else if (this.dataModel.showRecordedVideo() && this.dataModel.recordedVideo()) {
                showRecording = true;
            }
            else if (this.dataModel.showLiveVideo()) {
                showLive = true;
            }

            if (showLive) {
                if (typeof player !== 'undefined' && player.video_stream) {
                    srcObject = player.video_stream;
                    this.myVideoElem.muted = true;
                    this.myVideoElem.volume = 0;
                    this.dataModel.playbackMode("live");
                }
            }
            else if (showRecording) {
                srcObject = this.dataModel.recordedVideo();
                this.myVideoElem.muted = false;
                this.myVideoElem.volume = 1;
                this.dataModel.playbackMode("replayRec");
            }
            else {
                this.dataModel.playbackMode("off");
            }

            if (srcObject) {
                try {
                    self.myVideoElem.src = self.myVideoElem.srcObject = null;
                    self.myVideoElem.srcObject = srcObject;
                } catch (error) {
                    self.myVideoElem.src = URL.createObjectURL(srcObject);
                }

                if (self.dataModel.playbackMode() == "live") {
                    self.dataModel.currentlyPlaying(false);
                    self.myVideoElem.play();
                }
            }
            else {
                self.myVideoElem.pause();
                self.myVideoElem.srcObject = null;
                self.myVideoElem.src = null;
            }

        }
    }
    VideoRecordingPreviewAndPlayerViewModel.prototype.afterRenderInit = function (elem) {
        var self = this;

        this.myVideoElem = $(elem).find(".recordedVideoPlaybackElem")[0];
        this.seekBar = $(elem).find('.seek-bar')[0];

        if (this.seekBar) {
            $(this.seekBar).on("change", function () {
                self.dataModel.jumpToByFraction(self.seekBar.value / 100);
            });

        }

        // Update the seek bar as the video plays
        if (this.myVideoElem) {
            this.myVideoElem.addEventListener("timeupdate", this.timeUpdateListener);
            this.myVideoElem.addEventListener("ended", this.onPlaybackEnded);
        }

        this.updateVideoSrc();

    };
    VideoRecordingPreviewAndPlayerViewModel.prototype.dispose = function () {
        console.log("disposing VideoRecordingPreviewAndPlayerViewModel");
        // remove subscriber to be notified when the video should jump to specific time:
        var index = this.dataModel.subscribersForJumpEvents.indexOf(this.listenForJumpTo);
        if (index > -1) {
            this.dataModel.subscribersForJumpEvents.splice(index, 1);
        }
        if (this.myVideoElem) {
            if (this.subscriberTimePercentage) {
                this.subscriberTimePercentage.dispose();
            }
            if (this.recordedVideoSubscriber) {
                this.recordedVideoSubscriber.dispose();
            }
            if (this.currentlyRecordingSubscriber) {
                this.currentlyRecordingSubscriber.dispose();
            }
        }

        var myVideo = $(this.element).find('video')[0];

        if (this.myVideo) {
            myVideo.removeEventListener("timeupdate", this.timeUpdateListener);
            myVideo.removeEventListener("ended", this.onPlaybackEnded);
        }


        $(this.seekBar).off("change")
    };

    ko.components.register('videorecording-preview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new VideoRecordingPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'videorecording-preview-template' }
    });


    ko.components.register('videorecording-playerview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new VideoRecordingPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'videorecording-playerview-template' }
    });
}

