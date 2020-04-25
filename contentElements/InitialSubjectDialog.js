
/**
 * Creates a new Dialog and directly creates and initializes a new factor.
 *
 * @param {ExpTrialLoop} task - The data model of the task
 * @param {number} factorGroupIdx - The index of the factor group for the factor that is being created.
 * @constructor
 */
var InitialSubjectDialog = function (expData) {
    var self = this;

    this.expData = ko.observable(expData);
    this.divContainer = null;

    this.selectedSubjectGroup = ko.observable(null);
    this.selectedGroupNr = ko.pureComputed({
        read: function () {
            if (self.selectedSubjectGroup() !== undefined) {
                // using 1-based indexing:
                var groupNr = self.expData().availableGroups().indexOf(self.selectedSubjectGroup()) + 1;
                return groupNr;
            }
            else {
                return undefined;
            }
        },
        write: function (value) {
            var group = self.expData().availableGroups()[value - 1];
            self.selectedSubjectGroup(group);
        },
        owner: this
    });
    this.selectedSessionNr = ko.observable(1);
    this.subjectCode = ko.observable("");

    this.sessionsInGroup = ko.computed(function () {
        var arr = [];
        var subjGroups = self.selectedSubjectGroup();
        if (subjGroups) {
            for (var i = 0; i < subjGroups.sessions().length; i++) {
                arr.push({
                    nr: i + 1, // using 1-based indexing
                    name: subjGroups.sessions()[i].name
                });
            }
        }
        return arr;
    });

    this.cb = null;
};

InitialSubjectDialog.prototype.ok = function () {
    this.closeDialog();
    this.cb();
};

/**
 * closes the Dialog
 */
InitialSubjectDialog.prototype.closeDialog = function () {
    this.divContainer.dialog('destroy').remove();
};


/**
 * Opens the Dialog
 */

InitialSubjectDialog.prototype.start = function (cb) {

    this.cb = cb;

    this.divContainer = jQuery('<div/>');
    var self = this;
    this.divContainer.load("/html_views/InitialSubjectDialog.html?FILE_VERSION_PLACEHOLDER", function () {
        ko.applyBindings(self, self.divContainer[0]);
        self.divContainer.dialog({
            modal: true,
            width: 500,
            title: "Experiment Session",
            open: function (event, ui) {
            },
            close: function () {
                self.closeDialog();
            },
            beforeClose: function () {
            }
        });
    });
};

