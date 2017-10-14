
var AudioElement= function(expData) {

    var self = this;
    this.expData = expData;
    this.parent = null;

    this.type = "AudioElement";

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


    this.audioSource = ko.computed( function() {
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


AudioElement.prototype.label = "Audio";
AudioElement.prototype.iconPath = "/resources/icons/tools/tool_sound.svg";
AudioElement.prototype.dataType =      [ "string", "string"];
AudioElement.prototype.modifiableProp = ["file_id","file_orig_name"];

AudioElement.prototype.switchPlayState = function() {
    this.currentlyPlaying(!this.currentlyPlaying());
};

AudioElement.prototype.jumpToByFraction = function(fraction) {
    console.log("jump to fraction "+fraction);
    for (var i =0; i<this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({jumpToFraction: fraction});
    }
};

AudioElement.prototype.jumpToByTime = function(time) {
    console.log("jump to time "+time);
    for (var i =0; i<this.subscribersForJumpEvents.length; i++) {
        this.subscribersForJumpEvents[i]({jumpToTime: time});
    }
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
AudioElement.prototype.getAllModifiers = function(modifiersArr) {
    modifiersArr.push(this.modifier());
};

AudioElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

AudioElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

AudioElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

AudioElement.prototype.fromJS = function(data) {
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

AudioElement.prototype.toJS = function() {
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

    var AudioEditViewModel = function(dataModel, componentInfo){
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
    AudioEditViewModel.prototype.dispose = function() {
        console.log("disposing AudioEditViewModel");
        this.subscriberTimePercentage.dispose();
    };

    ko.components.register('audio-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new AudioEditViewModel(dataModel, componentInfo);
            }
        },
        template: {element: 'audio-editview-template'}
    });


    var AudioPreviewAndPlayerViewModel = function(dataModel, componentInfo){
        var self = this;
        this.element = componentInfo.element;
        this.dataModel = dataModel;

        var myPreloadedAudioSource = $(this.element).find('.preloadedSource')[0];
        if (myPreloadedAudioSource) {
            this.updateAudioSource = function () {
                // check if we have it preloaded:
                var audioElem;
                var htmlObjectUrl;
                if (player) {
                    if (typeof player.playerPreloader.queue !== 'undefined') {
                        var file_id = self.dataModel.modifier().selectedTrialView.file_id();
                        htmlObjectUrl = player.playerPreloader.preloadedObjectUrlsById[file_id];
                        audioElem = player.playerPreloader.queue.getResult(file_id);
                    }
                }

                if (audioElem instanceof HTMLAudioElement && htmlObjectUrl) {
                    myPreloadedAudioSource.src = htmlObjectUrl;
                }
                else {
                    myPreloadedAudioSource.src = self.dataModel.audioSource();
                }
                $(this.element).find('audio')[0].load();
            };
            this.updateAudioSource();
            self.dataModel.modifier().selectedTrialView.file_id.subscribe(function() {
                self.updateAudioSource();
            });
        }

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

        this.dataModel.audioSource.subscribe(function() {
            var myAudio = $(self.element).find('audio')[0];
            myAudio.load();
        });
    };
    AudioPreviewAndPlayerViewModel.prototype.dispose = function() {
        console.log("disposing AudioPreviewAndPlayerViewModel");
        // remove subscriber to be notified when the audio should jump to specific time:
        var index = this.dataModel.subscribersForJumpEvents.indexOf(this.listenForJumpTo);
        if (index > -1) {
            this.dataModel.subscribersForJumpEvents.splice(index, 1);
        }
        if (this.subscriberTimePercentage) {
            this.subscriberTimePercentage.dispose();
        }
        var myAudio = $(this.element).find('audio')[0];
        myAudio.removeEventListener("timeupdate", this.timeUpdateListener);
    };

    ko.components.register('audio-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                return new AudioPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: { element: 'audio-preview-template' }
    });

    ko.components.register('audio-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                return new AudioPreviewAndPlayerViewModel(dataModel, componentInfo);
            }
        },
        template: {element: 'audio-playerview-template'}
    });
}