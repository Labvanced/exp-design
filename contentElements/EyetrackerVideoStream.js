
var EyetrackerVideoStream = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "EyetrackerVideoStream";

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

EyetrackerVideoStream.prototype.label = "EyetrackerVideoStream";
EyetrackerVideoStream.prototype.iconPath = "/resources/icons/tools/tool_text.svg";
EyetrackerVideoStream.prototype.dataType =      [ ];
EyetrackerVideoStream.prototype.modifiableProp = [ ];
EyetrackerVideoStream.prototype.initWidth = 500;
EyetrackerVideoStream.prototype.initHeight = 80;


EyetrackerVideoStream.prototype.init = function() {

};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
EyetrackerVideoStream.prototype.getAllModifiers = function(modifiersArr) {
};

EyetrackerVideoStream.prototype.setPointers = function(entitiesArr) {
};

EyetrackerVideoStream.prototype.reAddEntities = function(entitiesArr) {
};

EyetrackerVideoStream.prototype.selectTrialType = function(selectionSpec) {

};

EyetrackerVideoStream.prototype.dispose = function () {
};

EyetrackerVideoStream.prototype.toJS = function() {
    return {
        type: this.type,
    };
};

EyetrackerVideoStream.prototype.fromJS = function(data) {
    this.type=data.type;
};

function createEyetrackerVideoStreamComponents() {
    ko.components.register('eyetrackervideostream-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                };
                return new viewModel(dataModel);
            }

        },
        template: {element: 'eyetrackervideostream-editview-template'}
    });

    ko.components.register('eyetrackervideostream-element-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'eyetrackervideostream-element-preview-template'}
    });


    ko.components.register('eyetrackervideostream-element-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;

                    var width = 280;
                    var height = 240;
                    var topDist = '0px';
                    var leftDist = '0px';

                    var setup = function() {
                        var videoElement = document.getElementById('webgazerVideoFeed');

                        webgazer.params.imgWidth = width;
                        webgazer.params.imgHeight = height;

                        var eyetrackingCanvas = document.createElement('canvas');
                        eyetrackingCanvas.id = 'eyetrackingCanvas';
                        eyetrackingCanvas.style.position = 'absolute';
                        eyetrackingCanvas.width = width;
                        eyetrackingCanvas.height = height;
                        componentInfo.element.appendChild(eyetrackingCanvas);

                        var overlay = document.createElement('canvas');
                        overlay.id = 'overlay';
                        overlay.style.position = 'absolute';
                        overlay.width = width;
                        overlay.height = height;
                        componentInfo.element.appendChild(overlay);

                        var cl = webgazer.getTracker().clm;

                        function drawLoop() {
                            requestAnimFrame(drawLoop);

                            var ctx = eyetrackingCanvas.getContext('2d');
                            ctx.drawImage(videoElement, 0, 0, eyetrackingCanvas.width, eyetrackingCanvas.height);

                            overlay.getContext('2d').clearRect(0,0,width,height);
                            if (cl.getCurrentPosition()) {
                                cl.draw(overlay);
                            }
                        }
                        drawLoop();
                    };
                    function checkIfReady() {
                        if (webgazer.isReady()) {
                            setup();
                        } else {
                            setTimeout(checkIfReady, 100);
                        }
                    }
                    if (window.hasOwnProperty('webgazer')) {
                        setTimeout(checkIfReady,100);
                    }
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'eyetrackervideostream-element-playerview-template'}
    });
}
