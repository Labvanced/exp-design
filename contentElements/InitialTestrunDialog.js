
/**
 * Creates a new Dialog and directly creates and initializes a new factor.
 *
 * @param {ExpTrialLoop} task - The data model of the task
 * @param {number} factorGroupIdx - The index of the factor group for the factor that is being created.
 * @constructor
 */
var InitialTestrunDialog= function(expData) {
    var self = this;

    this.expData = ko.observable(expData);
    this.divContainer = null;

    this.selectedSubjectGroup = ko.observable(null);
    this.selectedSessionNr = ko.observable(1);

    this.sessionsInGroup = ko.computed(function() {
        var arr = [];
        var subjGroups = self.selectedSubjectGroup();
        if (subjGroups) {
            for (var i = 0; i < subjGroups.sessions().length; i++) {
                arr.push({
                    nr: i+1, // using 1-based indexing
                    name: subjGroups.sessions()[i].name
                });
            }
        }
        return arr;
    });

    this.cb = null;
};

InitialTestrunDialog.prototype.ok = function () {
    this.closeDialog();
    var groupNr = this.expData().availableGroups().indexOf(this.selectedSubjectGroup()) + 1; // using 1-based indexing
    this.cb( groupNr, this.selectedSessionNr() );
};

/**
 * closes the Dialog
 */
InitialTestrunDialog.prototype.closeDialog = function () {
    this.divContainer.dialog('destroy').remove();
};


/**
 * Opens the Add Factor Dialog
 *
 * @param {MouseEvent} event - the click event that triggers the opening of the dialog
 */

InitialTestrunDialog.prototype.start = function (cb) {

    this.cb = cb;

    if (this.expData().availableGroups().length <= 1) {
        if (this.expData().availableGroups()[0].sessions().length <= 1) {
            // just start the only possible session:
            cb(1, 1);
            return;
        }
    }

    this.divContainer = jQuery('<div/>');
    var self = this;
    this.divContainer.load("/html_views/InitialTestrunDialog.html?FILE_VERSION_PLACEHOLDER", function () {
        ko.applyBindings(self,self.divContainer[0]);
        self.divContainer.dialog({
            modal: true,
            width: 500,
            title: "Test Run Settings",
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

