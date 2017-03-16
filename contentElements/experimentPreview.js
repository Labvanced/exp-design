/**
 * Created by cgoeke on 23.02.2017.
 */


var ExperimentPreview= function(experiment) {
    this.imageType = ko.observable(experiment.publishing_data.imageType());
    this.exp_name = ko.observable(experiment.publishing_data.exp_name());
    this.jdenticonHash = ko.observable(experiment.publishing_data.jdenticonHash());
    this.description = ko.observable(experiment.publishing_data.description());
};



ExperimentPreview.prototype.init = function(divWidth,divHeight) {



    $('#experimentPreview').css(
        "width",  divWidth
    );
    $('#experimentPreview').css(
        "height", divHeight
    );

    $('#identicon').css(
        "height", divHeight*0.75
    );
    $('#identicon').css(
        "width", divHeight*0.75
    );
    $('#ownImage').css(
        "height", divHeight*0.75
    );
    $('#ownImage').css(
        "width", divHeight*0.75
    );
    $('#heading').css(
        "font-size", Math.round(35*divWidth/1000)
    );
    jdenticon();
    //jdenticon.update("#identicon", this.jdenticonHash());
};
