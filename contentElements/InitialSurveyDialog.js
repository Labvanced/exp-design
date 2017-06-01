
/**
 * Creates a new Dialog and directly creates and initializes a new factor.
 *
 * @param {ExpTrialLoop} task - The data model of the task
 * @param {number} factorGroupIdx - The index of the factor group for the factor that is being created.
 * @constructor
 */
var InitialSurveyDialog= function(expData) {
    this.expData = ko.observable(expData);
    this.divContainer = null;

    this.selectedGender = ko.observable(null);
    this.selectedAge = ko.observable(null);
    this.selectedCountry = ko.observable(null);
    this.selectedLanguage = ko.observable(null);
    this.selectedEmail = ko.observable(null);

    this.requiredGender = ko.observable(false);
    this.requiredAge = ko.observable(false);
    this.requiredCountry = ko.observable(false);
    this.requiredLanguage = ko.observable(false);
    this.requiredEmail = ko.observable(false);

    this.okClicked = ko.observable(false);
    this.serverConfirmed = ko.observable(false);
    this.cb = null;

    // calculate required survey fields (it is required if the field is enabled in any group):
    var availableGroups = expData.availableGroups();
    for (var i=0; i<availableGroups.length; i++) {
        if (availableGroups[i].enabledGender()) {
            this.requiredGender(true);
        }
        if (availableGroups[i].enabledAge()) {
            this.requiredAge(true);
        }
        if (availableGroups[i].enabledCountry()) {
            this.requiredCountry(true);
        }
        if (availableGroups[i].enabledLanguage()) {
            this.requiredLanguage(true);
        }

        // email is required if more than one session:
        var sessionTimeData = availableGroups[i].sessionTimeData();
        if (sessionTimeData.length > 1) {
            this.requiredEmail(true);
        }
    }

    this.errorString = ko.computed(function() {
        var errorString = "";

        // validate if all required fields are filled:
        if (this.requiredGender()) {
            if (this.selectedGender() != "male" && this.selectedGender() != "female") {
                errorString += "Gender missing, ";
            }
        }
        if (this.requiredAge()) {
            if (!(this.selectedAge() > 0)) {
                errorString += "Age missing, ";
            }
        }
        if (this.requiredCountry()) {
            if (this.selectedCountry() == null) {
                errorString += "Country missing, ";
            }
        }
        if (this.requiredLanguage()) {
            if (this.selectedLanguage() == null) {
                errorString += "Language missing, ";
            }
        }
        if (this.requiredEmail()) {
            if (this.requiredEmail() == null) {
                errorString += "Email missing, ";
            }
        }

        // remove last comma:
        if (errorString!="") {
            errorString = errorString.substring(0, errorString.length - 2);
        }
        return errorString;
    }, this);


};

InitialSurveyDialog.prototype.ok = function () {
    this.okClicked(true);
    if (this.errorString() == "") {
        this.cb();
    }
};

InitialSurveyDialog.prototype.getSurveyData = function () {
    var survey_data = {
        selectedGender: this.selectedGender(),
        selectedAge: this.selectedAge(),
        selectedCountry: this.selectedCountry() ? this.selectedCountry().code : null,
        selectedLanguage: this.selectedLanguage() ? this.selectedLanguage().code : null,
        selectedEmail: this.selectedEmail()
    };
    return survey_data;
};

/**
 * closes the Dialog
 */
InitialSurveyDialog.prototype.closeDialog = function () {
    if (this.divContainer) {
        this.divContainer.dialog('destroy').remove();
    }
};


/**
 * Opens the Add Factor Dialog
 *
 * @param {MouseEvent} event - the click event that triggers the opening of the dialog
 */

InitialSurveyDialog.prototype.start = function (cb) {

    this.cb = cb;

    this.divContainer = jQuery('<div/>');
    var self = this;
    this.divContainer.load("/html_views/InitialSurveyDialog.html?FILE_VERSION_PLACEHOLDER", function () {
        ko.applyBindings(self,self.divContainer[0]);
        self.divContainer.dialog({
            modal: true,
            width: 500,
            title: "Initial Survey",
            closeOnEscape: false,
            open: function(event, ui) {
                $(".ui-dialog-titlebar-close").hide();
            },
            close: function () {
                self.closeDialog();
            },
            beforeClose: function () {
                return self.serverConfirmed();
            }
        });
    });
};

