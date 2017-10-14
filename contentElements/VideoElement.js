
var VideoElement= function(expData) {

    var self = this; 
    this.expData = expData;
    this.parent = null;

    this.type = "VideoElement";

    this.file_id = ko.observable(null);
    this.file_orig_name = ko.observable(null);
    this.showMediaControls = ko.observable(true);

    this.currentlyPlaying = ko.observable(false); // not serialized at the moment... maybe later?
    this.currentTimePercentage = ko.observable(0);

    this.shortName = ko.computed(function() {
        if (self.file_orig_name()){
            return (self.file_orig_name().length > 10 ? self.file_orig_name().substring(0, 9) + '...' : self.file_orig_name());
        }
        else return '';
    });

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    this.vidSource = ko.computed( function() {
        if (this.modifier().selectedTrialView.file_id() && this.modifier().selectedTrialView.file_orig_name()) {
            return "/files/" + this.modifier().selectedTrialView.file_id() + "/" + this.modifier().selectedTrialView.file_orig_name();
        }
        else {
            return false;
        }
    }, this);

    this.subscribersForJumpEvents = [];

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

VideoElement.prototype.label = "Video";
VideoElement.prototype.iconPath = "/resources/icons/tools/tool_video.svg";
VideoElement.prototype.dataType =      ["string", "string"];
VideoElement.prototype.modifiableProp = ["file_id","file_orig_name"];

VideoElement.prototype.switchPlayState = function() {
    this.currentlyPlaying(!this.currentlyPlaying());
};

VideoElement.prototype.jumpToByFraction = function(fraction) {
    console.log("jump to fraction "+fraction);
    for (var i =0; i<this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({jumpToFraction: fraction});
    }
};

VideoElement.prototype.jumpToByTime = function(time) {
    console.log("jump to time "+time);
    for (var i =0; i<this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({jumpToTime: time});
    }
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
VideoElement.prototype.getAllModifiers = function(modifiersArr) {
    modifiersArr.push(this.modifier());
};

VideoElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

VideoElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

VideoElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

VideoElement.prototype.fromJS = function(data) {
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

VideoElement.prototype.toJS = function() {
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


var VideoEditViewModel = function(dataModel, componentInfo){
    var self = this;

    this.element = componentInfo.element;
    this.dataModel = dataModel;
    var seekBar = $(this.element).find('.seek-bar')[0];
    seekBar.addEventListener("change", function() {
        dataModel.jumpToByFraction(seekBar.value / 100);
    });

    this.subscriberTimePercentage = this.dataModel.currentTimePercentage.subscribe(function(percentage) {
        seekBar.value = percentage;
    });
    seekBar.value = this.dataModel.currentTimePercentage();
};
VideoEditViewModel.prototype.dispose = function() {
    console.log("disposing VideoEditViewModel");
    this.subscriberTimePercentage.dispose();
};

function getBlobURL(url, mime, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("get", url);
    xhr.responseType = "arraybuffer";

    xhr.addEventListener("load", function() {

        var arrayBufferView = new Uint8Array( this.response );
        var blob = new Blob( [ arrayBufferView ], { type: mime } );
        var url = null;

        if ( window.URL ) {
            url = window.URL.createObjectURL(blob);
        } else if ( window.URL && window.URL.createObjectURL ) {
            url = window.URL.createObjectURL(blob);
        }

        callback(url, blob);
    });
    xhr.send();
}

/******************* View Model for Preview and for Player ***********************/

var VideoPreviewAndPlayerViewModel = function(dataModel, componentInfo){
    var self = this;
    this.element = componentInfo.element;
    this.dataModel = dataModel;



    var myPreloadedVideoSource = $(this.element).find('.videoSource')[0];
    if (myPreloadedVideoSource) {
        this.updateVideoSource = function () {
            // check if we have it preloaded:
            if(!self.dataModel.vidSource()){
                return;
            }
            var videoElem;
            var htmlObjectUrl;
            if (player) {
                if (typeof player.playerPreloader.queue !== 'undefined') {
                    var file_id = self.dataModel.modifier().selectedTrialView.file_id();
                    htmlObjectUrl = player.playerPreloader.preloadedObjectUrlsById[file_id];
                    videoElem = player.playerPreloader.queue.getResult(file_id);
                }
            }

            if (videoElem instanceof HTMLVideoElement && htmlObjectUrl) {
                myPreloadedVideoSource.src = htmlObjectUrl;
                $(self.element).find('video')[0].load();
            }
            else {
                getBlobURL(self.dataModel.vidSource(), "video/mp4", function(url, blob) {
                    myPreloadedVideoSource.src = url;
                    $(self.element).find('video')[0].load();
                });
            }

        };
        this.updateVideoSource();
        //TODO updateVideoSource is called twice because vidSource changes once for file_id and once for file_orig_name
        self.dataModel.vidSource.subscribe(function() {
            self.updateVideoSource();
        });
    }

    // only add playback functionality if not in sequence view:
    if ($(this.element).parents('#sequenceView').length == 0) {

        var myVideo = $(this.element).find('video')[0];
        var seekBar = $(this.element).find('.seek-bar')[0];

        seekBar.addEventListener("change", function () {
            dataModel.jumpToByFraction(seekBar.value / 100);
        });

        this.dataModel.currentlyPlaying.subscribe(function (value) {
            if (value) {
                myVideo.play();
            }
            else {
                myVideo.pause();
            }
        });

        // add subscriber to be notified when the video should jump to specific time:
        this.listenForJumpTo = function (evtParam) {
            if (evtParam.jumpToFraction) {
                var time = myVideo.duration * evtParam.jumpToFraction;
                console.log("setting video time to " + time);
                myVideo.currentTime = 5;
            }
        };
        this.dataModel.subscribersForJumpEvents.push(this.listenForJumpTo);

        // this needs to be defined here, but the handle saved in the object so that we can remove it later in dispose:
        this.timeUpdateListener = function () {
            if (!isNaN(myVideo.duration)) {
                var percentage = Math.floor(100 * myVideo.currentTime / myVideo.duration);
                self.dataModel.currentTimePercentage(percentage);
            }
        };
        // Update the seek bar as the video plays
        myVideo.addEventListener("timeupdate", this.timeUpdateListener);

        this.subscriberTimePercentage = this.dataModel.currentTimePercentage.subscribe(function (percentage) {
            seekBar.value = percentage;
        });
    }

    this.dataModel.vidSource.subscribe(function() {
        var myVideo = $(self.element).find('video')[0];
        myVideo.load();
    });
};

VideoPreviewAndPlayerViewModel.prototype.dispose = function() {
    console.log("disposing VideoPreviewAndPlayerViewModel");
    // remove subscriber to be notified when the video should jump to specific time:
    var index = this.dataModel.subscribersForJumpEvents.indexOf(this.listenForJumpTo);
    if (index > -1) {
        this.dataModel.subscribersForJumpEvents.splice(index, 1);
    }
    if (this.subscriberTimePercentage) {
        this.subscriberTimePercentage.dispose();
    }
    var myVideo = $(this.element).find('video')[0];
    myVideo.removeEventListener("timeupdate", this.timeUpdateListener);
};


/******************* CREATE COMPONENT METHOD ***********************/

function createVideoComponents() {

    ko.components.register('video-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new VideoEditViewModel(dataModel, componentInfo);
            }
        },
        template: {element: 'video-editview-template'}
    });

    ko.components.register('video-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                return new VideoPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'video-preview-template' }
    });

    ko.components.register('video-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                return new VideoPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: {element: 'video-playerview-template'}
    });
}


