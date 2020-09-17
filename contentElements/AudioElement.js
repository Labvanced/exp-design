
var AudioElement = function (expData) {

    var self = this;
    this.expData = expData;
    this.parent = null;

    this.type = "AudioElement";

    this.file_id = ko.observable(null);
    this.file_orig_name = ko.observable(null);
    this.showMediaControls = ko.observable(true);

    this.shortName = ko.computed(function () {
        if (self.file_orig_name()) {
            return (self.file_orig_name().length > 10 ? self.file_orig_name().substring(0, 9) + '...' : self.file_orig_name());
        }
        else return '';
    });

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    this.audioSource = ko.computed(function () {
        if (this.modifier().selectedTrialView.file_id() && this.modifier().selectedTrialView.file_orig_name()) {
            var file_route = "/files/";
            if (typeof player !== 'undefined') {
                file_route = "/player/files/" + player.expSessionNr + "/";
            }
            return file_route + this.modifier().selectedTrialView.file_id() + "/" + this.modifier().selectedTrialView.file_orig_name();
        }
        else {
            return false;
        }
    }, this);

    ///// not serialized
    this.subscribersForJumpEvents = [];
    this.subscribersForActions = [];
    this.currentlyPlaying = ko.observable(false); // not serialized at the moment... maybe later?
    this.currentTimePercentage = ko.observable(0);
    this.selected = ko.observable(false);
    this.file = ko.observable(null);
    /////
};


AudioElement.prototype.label = "Audio";
AudioElement.prototype.iconPath = "/resources/icons/tools/tool_sound.svg";
AudioElement.prototype.dataType = ["string", "string", "file"];
AudioElement.prototype.modifiableProp = ["file_id", "file_orig_name", "file"];
AudioElement.prototype.displayNames = ["file_id", "Filename", "Filedata"];
AudioElement.prototype.numVarNamesRequired = 0;
AudioElement.prototype.actionTypes = ["StartPlayback", "StopPlayback", "PausePlayback", "Mute", "Unmute"];
AudioElement.prototype.triggerTypes = ["PlaybackStarted", "PlaybackStopped"];

AudioElement.prototype.switchPlayState = function () {
    if (this.currentlyPlaying()) {
        this.executeAction("PausePlayback");
    }
    else {
        this.executeAction("StartPlayback");
    }
};

AudioElement.prototype.getActionTypes = function () {
    return AudioElement.prototype.actionTypes;
};

AudioElement.prototype.getTriggerTypes = function () {
    return AudioElement.prototype.triggerTypes;
};

AudioElement.prototype.executeAction = function (actionType) {
    for (var i = 0; i < this.subscribersForActions.length; i++) {
        this.subscribersForActions[i](actionType);
    }
};

AudioElement.prototype.jumpToByFraction = function (fraction) {
    for (var i = 0; i < this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({ jumpToFraction: fraction });
    }
};

AudioElement.prototype.jumpToByTime = function (time) {
    for (var i = 0; i < this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({ jumpToTime: time });
    }
};

AudioElement.prototype.dispose = function () {
    this.subscribersForJumpEvents = [];
    this.subscribersForActions = [];
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
AudioElement.prototype.getAllModifiers = function (modifiersArr) {
    modifiersArr.push(this.modifier());
};

AudioElement.prototype.setPointers = function (entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

AudioElement.prototype.reAddEntities = function (entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

AudioElement.prototype.selectTrialType = function (selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

AudioElement.prototype.fromJS = function (data) {
    var self = this;
    this.type = data.type;
    this.dataType = data.dataType;
    this.file_id(data.file_id);
    this.file_orig_name(data.file_orig_name);
    if (data.hasOwnProperty('showMediaControls')) {
        this.showMediaControls(data.showMediaControls);
    }
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);

    return this;
};

AudioElement.prototype.toJS = function () {
    return {
        type: this.type,
        dataType: this.dataType,
        file_id: this.file_id(),
        file_orig_name: this.file_orig_name(),
        showMediaControls: this.showMediaControls(),
        modifier: this.modifier().toJS()
    };
};

function createAudioComponents() {

    var AudioEditViewModel = function (dataModel, componentInfo) {
        var self = this;

        this.element = componentInfo.element;
        this.dataModel = dataModel;
        var seekBar = $(this.element).find('.seek-bar')[0];
        this.changeListener = function () {
            dataModel.jumpToByFraction(seekBar.value / 100);
        };
        seekBar.addEventListener("change", this.changeListener);

        this.subscriberTimePercentage = this.dataModel.currentTimePercentage.subscribe(function (percentage) {
            seekBar.value = percentage;
        });
        seekBar.value = this.dataModel.currentTimePercentage();
    };
    AudioEditViewModel.prototype.dispose = function () {
        this.subscriberTimePercentage.dispose();
        var seekBar = $(this.element).find('.seek-bar')[0];
        seekBar.removeEventListener("change", this.changeListener);
    };

    ko.components.register('audio-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new AudioEditViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'audio-editview-template' }
    });


    var AudioPreviewAndPlayerViewModel = function (dataModel, componentInfo) {
        var self = this;
        this.element = componentInfo.element;
        this.dataModel = dataModel;
        this.sourceSubscriber = null;
        this.audioElem = $(this.element).find('audio')[0];
        this.audioSourceElem = $(this.element).find('.audioSource')[0];
        this.startPlaybackAfterLoading = false;
        this.loading = false;

        this.updateSource();
        //TODO updateAudioSource is called twice because audioSource changes once for file_id and once for file_orig_name
        this.sourceSubscriber = this.dataModel.audioSource.subscribe(function () {
            self.updateSource();
        });

        // only add playback functionality if not in sequence view:
        if ($(this.element).parents('#sequenceView').length == 0) {

            var seekBar = $(this.element).find('.seek-bar')[0];
            $(seekBar).on("click", function (param1) {
                var widthClicked = param1.pageX - $(this).offset().left;
                var totalWidth = $(this)[0].getBoundingClientRect().width;
                var fractionClicked = widthClicked / totalWidth;
                dataModel.jumpToByFraction(fractionClicked);
            });

            // add subscriber to be notified when the audio should jump to specific time:
            this.listenForJumpTo = function (evtParam) {
                if (evtParam.jumpToFraction) {
                    var time = self.audioElem.duration * evtParam.jumpToFraction;
                    self.audioElem.currentTime = time;
                }
                else if (evtParam.jumpToTime) {
                    self.audioElem.currentTime = evtParam.jumpToTime;
                }
            };
            this.dataModel.subscribersForJumpEvents.push(this.listenForJumpTo);

            this.listenForExecuteAction = function (actionType) {
                self.executeAction(actionType);
            };
            this.dataModel.subscribersForActions.push(this.listenForExecuteAction);

            this.onpauseListener = function () {
                self.dataModel.currentlyPlaying(false);
                $(self.dataModel.parent).trigger("PlaybackStopped");
            };
            this.audioElem.addEventListener("pause", this.onpauseListener);

            this.oncanplaythroughListener = function () {
                if (self.loading) {
                    self.loading = false;
                    if (self.startPlaybackAfterLoading) {
                        self.startPlaybackAfterLoading = false; // to prevent firing again later when seeking with progress bar
                        self.executeAction("StartPlayback");
                    }
                }
            };
            this.audioElem.addEventListener("canplaythrough", this.oncanplaythroughListener);

            this.onplayListener = function () {
                self.dataModel.currentlyPlaying(true);
                $(self.dataModel.parent).trigger("PlaybackStarted");
            };
            this.audioElem.addEventListener("play", this.onplayListener);

            // this needs to be defined here, but the handle saved in the object so that we can remove it later in dispose:
            this.timeUpdateListener = function () {
                if (!isNaN(self.audioElem.duration)) {
                    var percentage = Math.floor(100 * self.audioElem.currentTime / self.audioElem.duration);
                    self.dataModel.currentTimePercentage(percentage);
                }
            };
            // Update the seek bar as the audio plays
            this.audioElem.addEventListener("timeupdate", this.timeUpdateListener);

            // on ended listener:
            this.onEndedListener = function () {
                self.dataModel.currentlyPlaying(false);
            };
            this.audioElem.addEventListener("ended", this.onEndedListener);

            this.subscriberTimePercentage = this.dataModel.currentTimePercentage.subscribe(function (percentage) {
                seekBar.value = percentage;
            });
        }
    };

    AudioPreviewAndPlayerViewModel.prototype.updateSource = function () {
        var self = this;

        var audioSource = this.dataModel.audioSource();
        if (!audioSource) {
            return;
        }

        // check if we have it preloaded:
        var preloadedSource;
        var htmlObjectUrl;
        if (typeof player !== 'undefined') {
            var file_id = this.dataModel.modifier().selectedTrialView.file_id();
            htmlObjectUrl = player.playerPreloader.preloadedObjectUrlsById[file_id];
            preloadedSource = player.playerPreloader.queue.getResult(file_id);
        }

        this.loading = true;
        if (preloadedSource instanceof HTMLAudioElement && htmlObjectUrl) {
            // is preloaded already.
            this.audioSourceElem.src = htmlObjectUrl;
            this.audioElem.load();
        }
        else {
            // Need to first fully load the file and create a blob to support the following features: 
            // 1. iOS/iPad/Safari
            // 2. Seek
            // 3. OnFinishPlayback-Triggers
            // (If you need streaming / buffering, then use youtube)
            getBlobURL(audioSource, "audio/mpeg", function (url, blob) {
                self.audioSourceElem.src = url;
                self.audioElem.load();
            });
        }
    };

    AudioPreviewAndPlayerViewModel.prototype.executeAction = function (actionType) {
        if (actionType == "StartPlayback") {
            if (this.loading) {
                this.startPlaybackAfterLoading = true;
            }
            else {
                this.audioElem.play();
            }
        }
        else if (actionType == "StopPlayback") {
            this.startPlaybackAfterLoading = false;
            this.audioElem.pause();
            this.audioElem.currentTime = 0;
        }
        else if (actionType == "PausePlayback") {
            this.startPlaybackAfterLoading = false;
            this.audioElem.pause();
        }
        else if (actionType == "Mute") {
            this.audioElem.muted = true;
        }
        else if (actionType == "Unmute") {
            this.audioElem.muted = false;
        }
    };

    AudioPreviewAndPlayerViewModel.prototype.dispose = function () {
        // remove subscriber to be notified when the audio should jump to specific time:
        var index = this.dataModel.subscribersForJumpEvents.indexOf(this.listenForJumpTo);
        if (index > -1) {
            this.dataModel.subscribersForJumpEvents.splice(index, 1);
            this.listenForJumpTo = null;
        }

        var executeCbIndex = this.dataModel.subscribersForActions.indexOf(this.listenForExecuteAction);
        if (executeCbIndex > -1) {
            this.dataModel.subscribersForActions.splice(executeCbIndex, 1);
        }

        if (this.subscriberTimePercentage) {
            this.subscriberTimePercentage.dispose();
        }
        if (this.sourceSubscriber) {
            this.sourceSubscriber.dispose();
        }

        this.audioElem.removeEventListener("pause", this.onpauseListener);
        this.audioElem.removeEventListener("canplaythrough", this.oncanplaythroughListener);
        this.audioElem.removeEventListener("play", this.onplayListener);
        this.audioElem.removeEventListener("timeupdate", this.timeUpdateListener);
        this.audioElem.removeEventListener("ended", this.onEndedListener);

        this.onpauseListener = null;
        this.oncanplaythroughListener = null;
        this.onplayListener = null;
        this.timeUpdateListener = null;
        this.onEndedListener = null;

        var seekBar = $(this.element).find('.seek-bar')[0];
        $(seekBar).off("click");
    };

    ko.components.register('audio-preview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new AudioPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'audio-preview-template' }
    });

    ko.components.register('audio-playerview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new AudioPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'audio-playerview-template' }
    });
}