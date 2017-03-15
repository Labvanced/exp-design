// � by Caspar Goeke and Holger Finger

/**
 * This class stores the exp_data together with all meta states
 * @constructor
 */
var Experiment = function () {
    this.exp_id = ko.observable(0);
    this.guid = ko.observable(guid());
    this.exp_name = ko.observable('');
    this.version = ko.observable(1);
    this.status = ko.observable('create'); //  "Create";"Record";"Analyze";"Finished"
    this.num_exp_subjects = ko.observable(null);

    
    // setup class instances for experiment functions
    this.exp_data = new ExpData(this);
    this.exp_data_obs = ko.observable(this.exp_data);
    this.publishing_data = new PublishingData(this);
    this.analysis_data = new AnalysisData(this);
    this.private_data = new PrivateData(this);

    this.dateLastModified = ko.observable(this.publishing_data.getCurrentDate());

    // local temporary member variables:
    this.hasLocalChanges = false;
    this.changesInTransit = false;
    this.tempDisableAutosave = false;
    this.lastSavedJsons = [];

    var self = this;

    this.exp_name.subscribe(function(value) {
        self.publishing_data.exp_name(value)
    });
};




Experiment.prototype.editExp = function() {
    page("/page/editors/experimentView/"+this.exp_id());
  //  page("/page/editors/mainExperimentPage/"+this.exp_id());
};

Experiment.prototype.viewRecordings = function() {
    page("/page/recordingsPage/"+this.exp_id());
};

Experiment.prototype.copyExp = function() {

};

Experiment.prototype.publish = function() {
    this.status('record');
    this.publishing_data.status('published');
    this.save();
};

Experiment.prototype.endRecs = function() {
    this.status('analyze');
    this.publishing_data.status('done');
    this.save();
};


Experiment.prototype.editSettings = function() {
    this.publishing_data.status('editing');
    this.save();
};

/**
 * should be called by the ui classes after a change was made to some sub datamodels of this expData.
 */
Experiment.prototype.notifyChanged = function() {
    this.hasLocalChanges = true;

    if (!this.tempDisableAutosave) {
        // only automatically save if there is not already a saving process in transit:
        if (uc.autoSaveEnabled() && !this.changesInTransit) {
            this.save();
        }
        else {
            if (uc.ctrlZenabled()) {
                var serializedExp = this.toJS();
                this.addToHistory(serializedExp);
            }
        }
    }
};

Experiment.prototype.addToHistory = function(serializedExp) {
    this.lastSavedJsons.push(serializedExp);
    if (this.lastSavedJsons.length > 4) {
        this.lastSavedJsons.shift();
    }
};

/**
 * save this experiment and send to server
 */
Experiment.prototype.save = function() {
    var self = this;

    this.publishing_data.dateLastModified(this.publishing_data.getCurrentDate()); // set currentDate

    console.log("save experiment " + this.exp_name() + " and send to server...");

    try {
        var serializedExp = this.toJS();
        if (uc.ctrlZenabled()) {
            this.addToHistory(serializedExp);
        }
        this.changesInTransit = true;
        this.hasLocalChanges = false;
        uc.socket.emit('updateExperiment', serializedExp, function(response){
            if (response.success){
                self.changesInTransit = false;
                console.log("saved experiment success");
                if (self.hasLocalChanges) {
                    // restart saving process for the new local changes that were made in the meantime
                    self.save();
                }
            }
            else {
                console.log("error: could not transmit experiment to server.");
            }
        });
    }
    catch (err) {
        var tempDialog = $('<div><p>Error message:</p><p class="error text-danger">'+err.message+'</p></div>');
        tempDialog.dialog({
            modal: true,
            title: "Error Saving Experiment",
            resizable: false,
            width: 300,
            buttons: [
                {
                    text: "Retry",
                    click: function () {
                        self.toJS();
                    }
                },
                {
                    text: "Reload from Server",
                    click: function () {
                        window.location.reload(false);
                        $( this ).dialog( "close" );
                    }
                }
            ]
        });
    }

};






/**
 * revert last step
 */
Experiment.prototype.revertLastSave = function() {
    if (uc.ctrlZenabled() && this.lastSavedJsons.length > 1) {
        console.log("revert last step");
        if (uc.currentEditorView instanceof TrialEditor) {
            var task_id = uc.currentEditorView.expTrialLoop().id();
            this.lastSavedJsons.pop();
            var temp = this.lastSavedJsons[this.lastSavedJsons.length - 1];
            this.fromJS(temp);
            this.setPointers();
            var task = this.exp_data.entities.byId[task_id];
            uc.currentEditorView.setTask(task);
        }
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Experiment.prototype.setPointers = function() {
    if (this.exp_data instanceof ExpData) {
        this.exp_data.setPointers();
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Experiment}
 */
Experiment.prototype.fromJS = function(data) {
    this.guid(data.guid);
    this.exp_id(data.exp_id);
    this.exp_name(data.exp_name);
    this.version(data.version);
    this.status(data.status);
    this.num_exp_subjects(data.num_exp_subjects);
    this.dateLastModified(data.dateLastModified);
    if (data.hasOwnProperty("exp_data")){
        this.exp_data = new ExpData(this);
        this.exp_data.fromJS(data.exp_data);
    }
    else {
        this.exp_data = "not loaded";
    }

    if (data.hasOwnProperty("publishing_data") && data.publishing_data != null){
        this.publishing_data.fromJS(data.publishing_data);
    }

    if (data.hasOwnProperty("analysis_data") && data.analysis_data != null){
        this.analysis_data.fromJS(data.analysis_data);
    }

    if (data.hasOwnProperty("private_data") && data.private_data != null){
        this.private_data.fromJS(data.private_data);
    }

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
Experiment.prototype.toJS = function() {

    if (this.exp_data instanceof ExpData){
        var exp_data_serialized = this.exp_data.toJS();
    }
    else {
        var exp_data_serialized = null;
    }

    if (this.publishing_data instanceof PublishingData){
        var publishing_data_serialized = this.publishing_data.toJS();
    }
    else {
        var publishing_data_serialized = null;
    }

    if (this.analysis_data instanceof AnalysisData){
        var analysisData_serialized = this.analysis_data.toJS();
    }
    else {
        var analysisData_serialized = null;
    }

    if (this.private_data instanceof PrivateData){
        var private_data_serialized = this.private_data.toJS();
    }
    else {
        var private_data_serialized = null;
    }
    
    return {
        guid: this.guid(),
        exp_id: this.exp_id(),
        exp_name: this.exp_name(),
        version: this.version(),
        status: this.status(),
        num_exp_subjects: this.num_exp_subjects(),
        dateLastModified: this.dateLastModified(),
        exp_data: exp_data_serialized,
        publishing_data: publishing_data_serialized,
        analysis_data: analysisData_serialized,
        private_data: private_data_serialized
    };
};
