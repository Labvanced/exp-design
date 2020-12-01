
var VideoElement = function (expData) {

    var self = this;
    this.expData = expData;
    this.parent = null;

    this.type = "VideoElement";

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

    this.vidSource = ko.computed(function () {
        if (this.modifier().selectedTrialView.file_id() && this.modifier().selectedTrialView.file_orig_name()) {
            var file_route = "/files/";
            if (typeof player !== 'undefined') {
                file_route = "/player/files/" + player.expSessionNr + "/";
                if (is_nwjs()) {
                    if (player.playerPreloader.preloadedObjectUrlsById.hasOwnProperty(this.modifier().selectedTrialView.file_id())) {
                        return player.playerPreloader.preloadedObjectUrlsById[this.modifier().selectedTrialView.file_id()];
                    }
                    else {
                        return "file://" + player.getNwjsImgPath(this.modifier().selectedTrialView.file_id(), this.modifier().selectedTrialView.file_orig_name());
                    }
                }
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

VideoElement.prototype.label = "Video";
VideoElement.prototype.iconPath = "/resources/icons/tools/tool_video.svg";
VideoElement.prototype.dataType = ["string", "string", "file"];
VideoElement.prototype.modifiableProp = ["file_id", "file_orig_name", "file"];
VideoElement.prototype.displayNames = ["file_id", "Filename", "Filedata"];
VideoElement.prototype.actionTypes = ["StartPlayback", "StopPlayback", "PausePlayback", "Mute", "Unmute"];
VideoElement.prototype.triggerTypes = ["PlaybackStarted", "PlaybackStopped"];
VideoElement.prototype.numVarNamesRequired = 0;

VideoElement.prototype.switchPlayState = function () {
    if (this.currentlyPlaying()) {
        this.executeAction("PausePlayback");
    }
    else {
        this.executeAction("StartPlayback");
    }
};

VideoElement.prototype.getActionTypes = function () {
    return VideoElement.prototype.actionTypes;
};

VideoElement.prototype.getTriggerTypes = function () {
    return VideoElement.prototype.triggerTypes;
};

VideoElement.prototype.executeAction = function (actionType) {
    for (var i = 0; i < this.subscribersForActions.length; i++) {
        this.subscribersForActions[i](actionType);
    }
};

VideoElement.prototype.jumpToByFraction = function (fraction) {
    for (var i = 0; i < this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({ jumpToFraction: fraction });
    }
};

VideoElement.prototype.jumpToByTime = function (time) {
    for (var i = 0; i < this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({ jumpToTime: time });
    }
};

VideoElement.prototype.dispose = function () {
    this.subscribersForJumpEvents = [];
    this.subscribersForActions = [];
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
VideoElement.prototype.getAllModifiers = function (modifiersArr) {
    modifiersArr.push(this.modifier());
};

VideoElement.prototype.setPointers = function (entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

VideoElement.prototype.reAddEntities = function (entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

VideoElement.prototype.selectTrialType = function (selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

VideoElement.prototype.fromJS = function (data) {
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

VideoElement.prototype.toJS = function () {
    return {
        type: this.type,
        dataType: this.dataType,
        file_id: this.file_id(),
        file_orig_name: this.file_orig_name(),
        showMediaControls: this.showMediaControls(),
        modifier: this.modifier().toJS()
    };
};



/******************* View Model for Properties ***********************/


var VideoEditViewModel = function (dataModel, componentInfo) {
    var self = this;

    this.element = componentInfo.element;
    this.dataModel = dataModel;
    var seekBar = $(this.element).find('.seek-bar')[0];
    seekBar.addEventListener("change", function () {
        dataModel.jumpToByFraction(seekBar.value / 100);
    });

    this.subscriberTimePercentage = this.dataModel.currentTimePercentage.subscribe(function (percentage) {
        seekBar.value = percentage;
    });
    seekBar.value = this.dataModel.currentTimePercentage();
};
VideoEditViewModel.prototype.dispose = function () {
    this.subscriberTimePercentage.dispose();
};

/******************* View Model for Preview and for Player ***********************/

var VideoPreviewAndPlayerViewModel = function (dataModel, componentInfo) {
    var self = this;
    this.element = componentInfo.element;
    this.dataModel = dataModel;
    this.sourceSubscriber = null;
    this.videoElem = $(this.element).find('video')[0];
    this.videoSourceElem = $(this.element).find('.videoSource')[0];
    this.startPlaybackAfterLoading = false;
    this.loading = false;

    if (this.videoSourceElem) {
        this.updateSource();

        //TODO updateSource is called twice because vidSource changes once for file_id and once for file_orig_name
        this.sourceSubscriber = this.dataModel.vidSource.subscribe(function () {
            self.updateSource();
        });
    }

    // only add playback functionality if not in sequence view:
    if ($(this.element).parents('#sequenceView').length == 0) {

        var seekBar = $(this.element).find('.seek-bar')[0];
        seekBar.addEventListener("click", function (param1) {
            var widthClicked = param1.pageX - $(this).offset().left;
            var totalWidth = $(this)[0].getBoundingClientRect().width;
            var fractionClicked = widthClicked / totalWidth;
            dataModel.jumpToByFraction(fractionClicked);
        });

        // add subscriber to be notified when the video should jump to specific time:
        this.listenForJumpTo = function (evtParam) {
            if (evtParam.jumpToFraction) {
                var time = self.videoElem.duration * evtParam.jumpToFraction;
                self.videoElem.currentTime = time;
            }
            else if (evtParam.jumpToTime) {
                self.videoElem.currentTime = evtParam.jumpToTime;
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
        this.videoElem.addEventListener("pause", this.onpauseListener);

        this.oncanplaythroughListener = function () {
            if (self.loading) {
                self.loading = false;
                if (self.startPlaybackAfterLoading) {
                    self.startPlaybackAfterLoading = false; // to prevent firing again later when seeking with progress bar
                    self.executeAction("StartPlayback");
                }
            }
        };
        this.videoElem.addEventListener("canplaythrough", this.oncanplaythroughListener);

        this.onplayListener = function () {
            self.dataModel.currentlyPlaying(true);
            $(self.dataModel.parent).trigger("PlaybackStarted");
        };
        this.videoElem.addEventListener("play", this.onplayListener);

        // this needs to be defined here, but the handle saved in the object so that we can remove it later in dispose:
        this.timeUpdateListener = function () {
            if (!isNaN(self.videoElem.duration)) {
                var percentage = Math.floor(100 * self.videoElem.currentTime / self.videoElem.duration);
                self.dataModel.currentTimePercentage(percentage);
            }
        };
        this.videoElem.addEventListener("timeupdate", this.timeUpdateListener);

        // on ended listener:
        this.onEndedListener = function () {
            self.dataModel.currentlyPlaying(false);
        };
        this.videoElem.addEventListener("ended", this.onEndedListener);

        this.subscriberTimePercentage = this.dataModel.currentTimePercentage.subscribe(function (percentage) {
            seekBar.value = percentage;
        });
    }
};

VideoPreviewAndPlayerViewModel.prototype.updateSource = function () {
    var self = this;

    var vidSource = this.dataModel.vidSource();
    if (!vidSource) {
        return;
    }

    // check if we have it preloaded:
    var preloadedVideoElem;
    var htmlObjectUrl;
    if (typeof player !== 'undefined') {
        var file_id = this.dataModel.modifier().selectedTrialView.file_id();
        htmlObjectUrl = player.playerPreloader.preloadedObjectUrlsById[file_id];
        preloadedVideoElem = player.playerPreloader.queue.getResult(file_id);
    }

    this.loading = true;
    if (preloadedVideoElem instanceof HTMLVideoElement && htmlObjectUrl) {
        // is preloaded already.
        this.videoSourceElem.src = htmlObjectUrl;
        this.videoElem.load();
    }
    else {
        // Need to first fully load the file and create a blob to support the following features: 
        // 1. iOS/iPad/Safari
        // 2. Seek
        // 3. OnFinishPlayback-Triggers
        // (If you need streaming / buffering, then use youtube)
        getBlobURL(vidSource, "video/mp4", function (url, blob) {
            self.videoSourceElem.src = url;
            self.videoElem.load();
        });
    }

};

VideoPreviewAndPlayerViewModel.prototype.executeAction = function (actionType) {
    if (actionType == "StartPlayback") {
        if (this.loading) {
            this.startPlaybackAfterLoading = true;
        }
        else {
            this.videoElem.play();
        }
    }
    else if (actionType == "StopPlayback") {
        this.startPlaybackAfterLoading = false;
        this.videoElem.pause();
        this.videoElem.currentTime = 0;
    }
    else if (actionType == "PausePlayback") {
        this.startPlaybackAfterLoading = false;
        this.videoElem.pause();
    }
    else if (actionType == "Mute") {
        this.videoElem.muted = true;
    }
    else if (actionType == "Unmute") {
        this.videoElem.muted = false;
    }
};

VideoPreviewAndPlayerViewModel.prototype.dispose = function () {
    // remove subscriber to be notified when the video should jump to specific time:
    var index = this.dataModel.subscribersForJumpEvents.indexOf(this.listenForJumpTo);
    if (index > -1) {
        this.dataModel.subscribersForJumpEvents.splice(index, 1);
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

    this.videoElem.removeEventListener("pause", this.onpauseListener);
    this.videoElem.removeEventListener("canplaythrough", this.oncanplaythroughListener);
    this.videoElem.removeEventListener("play", this.onplayListener);
    this.videoElem.removeEventListener("timeupdate", this.timeUpdateListener);
    this.videoElem.removeEventListener("ended", this.onEndedListener);

    this.onpauseListener = null;
    this.oncanplaythroughListener = null;
    this.onplayListener = null;
    this.timeUpdateListener = null;
    this.onEndedListener = null;

    var seekBar = $(this.element).find('.seek-bar')[0];
    $(seekBar).off("click");
};


/******************* CREATE COMPONENT METHOD ***********************/

function createVideoComponents() {

    ko.components.register('video-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new VideoEditViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'video-editview-template' }
    });

    ko.components.register('video-preview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new VideoPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'video-preview-template' }
    });

    ko.components.register('video-playerview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new VideoPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'video-playerview-template' }
    });
}


