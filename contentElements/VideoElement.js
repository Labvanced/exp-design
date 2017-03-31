

var VideoElement= function(expData) {

    var self = this; 
    this.expData = expData;
    this.parent = null;

    this.type = "VideoElement";
    this.name = ko.observable("Video");

    this.file_id = ko.observable(null);
    this.file_orig_name = ko.observable(null);
    this.showMediaControls = ko.observable(true);

    this.currentlyPlaying = ko.observable(false); // not serialized at the moment... maybe later?
    this.currentTimeAsFraction = ko.observable(0);

    this.shortName = ko.computed(function() {
        if (self.file_orig_name()){
            return (self.file_orig_name().length > 10 ? self.file_orig_name().substring(0, 9) + '...' : self.file_orig_name());
        }
        else return '';
       
    });

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    // not serialized
    this.shape = "square";
    this.label = "Video";

    this.vidSource = ko.computed( function() {
        if (this.modifier().selectedTrialView.file_id() && this.modifier().selectedTrialView.file_orig_name()) {
            return "/files/" + this.modifier().selectedTrialView.file_id() + "/" + this.modifier().selectedTrialView.file_orig_name();
        }
        else {
            return false;
        }
    }, this);

    this.subscribersForJumpEvents = [];
};


VideoElement.prototype.dataType =      [ "string", "string", "string"];
VideoElement.prototype.modifiableProp = ["name","file_id","file_orig_name"];

VideoElement.prototype.switchPlayState = function() {
    // see http://blog.teamtreehouse.com/building-custom-controls-for-html5-videos
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
    this.name(data.name);
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
        name: this.name(),
        file_id: this.file_id(),
        file_orig_name: this.file_orig_name(),
        showMediaControls: this.showMediaControls(),
        modifier: this.modifier().toJS()

    };
};

function createVideoComponents() {

    var VideoEditViewModel = function(dataModel, componentInfo){
        this.element = componentInfo.element;
        this.dataModel = dataModel;
        var seekBar = $(this.element).find('.seek-bar')[0];
        seekBar.addEventListener("change", function() {
            dataModel.jumpToByFraction(seekBar.value / 100);
        });
        this.name = dataModel.parent.name;
    };
    VideoEditViewModel.prototype.dispose = function() {
        console.log("disposing VideoEditViewModel");
    };

    ko.components.register('video-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new VideoEditViewModel(dataModel, componentInfo);
            }
        },
        template: {element: 'video-editview-template'}
    });


    var VideoPreviewAndPlayerViewModel = function(dataModel, componentInfo){
        var self = this;
        this.element = componentInfo.element;
        this.dataModel = dataModel;

        var myVideo = $(this.element).find('video')[0];
        var seekBar = $(this.element).find('.seek-bar')[0];

        seekBar.addEventListener("change", function() {
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
        this.listenForJumpTo = function(evtParam) {
            if (evtParam.jumpToFraction) {
                var time = myVideo.duration * evtParam.jumpToFraction;
                console.log("setting video time to "+time);
                myVideo.currentTime = 5;
            }
        };
        this.dataModel.subscribersForJumpEvents.push(this.listenForJumpTo);

        // Update the seek bar as the video plays
        myVideo.addEventListener("timeupdate", function() {
            var value = myVideo.currentTime / myVideo.duration;
            self.dataModel.currentTimeAsFraction(value);
            console.log("current time as fraction: "+value);
            seekBar.value = value * 100;
        });
    };
    VideoPreviewAndPlayerViewModel.prototype.dispose = function() {
        console.log("disposing VideoPreviewAndPlayerViewModel");
        // remove subscriber to be notified when the video should jump to specific time:
        var index = this.dataModel.subscribersForJumpEvents.indexOf(this.listenForJumpTo);
        if (index > -1) {
            this.dataModel.subscribersForJumpEvents.splice(index, 1);
        }
    };

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


