// � by Caspar Goeke and Holger Finger

/**
 * This class stores the exp_data together with all meta states
 * @constructor
 */
var Experiment = function () {

    //////////////////////////// WARNING ////////////////////////////
    //                                                             //
    //           DO NOT CHANGE THIS CLASS, BECAUSE IT              //
    //           REQUIRES REFACTORING OF THE DATABASE!             //
    //                                                             //
    /////////////////////////////////////////////////////////////////

    this.exp_id = ko.observable(0);
    this.guid = ko.observable(guid());
    this.exp_name = ko.observable('');
    this.version = ko.observable(1);
    this.status = ko.observable('create'); //  "create";"record";"analyze";"finished"
    this.num_exp_subjects = ko.observable(null);
    this.rec_session_data = [];

    this.add_time = ko.observable("");
    this.modified_time = ko.observable("");

    // setup class instances for experiment functions
    this.exp_data = new ExpData(this);
    this.exp_data_obs = ko.observable(this.exp_data);
    this.publishing_data = new PublishingData(this);
    this.analysis_data = new AnalysisData(this);
    this.private_data = new PrivateData(this);
    this.exp_server_data = ko.observable(null);
    this.exp_run_data = ko.observable(new ExpRunData());

    // copy of study settings:
    this.study_settings = ko.observable(null);

    // local temporary member variables:
    this.hasLocalChanges = false;
    this.changesInTransit = false;
    this.tempDisableAutosave = false;
    this.lastSavedJsons = [];

    //////////////////////////// WARNING ////////////////////////////
    //                                                             //
    //           DO NOT CHANGE THIS CLASS, BECAUSE IT              //
    //           REQUIRES REFACTORING OF THE DATABASE!             //
    //                                                             //
    /////////////////////////////////////////////////////////////////

    var self = this;
    this.total_num_recordings = ko.computed(function() {
        if (self.exp_server_data()) {
            var d = self.exp_server_data();
            return d.numSubjectsRecordedCrowd + d.numSubjectsRecordedExternal +d.numSubjectsRecordedLibrary + d.numSubjectsRecordedSmart;
        }
        else {
            return 0;
        }
    });

    this.canBeModifiedOrDeleted = ko.computed(function () {
        if (this.status() == "create"){
            return true;
        }
        else{
            return false;
        }
    }, this);

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

Experiment.prototype.stopPublishExp = function(cb) {
    var self = this;

    if (this.publishing_data.recruitingEnabled()) {
        if (this.publishing_data.recruitViaCrowdsourcing()) {
            console.log("cannot disable publishing because crowdsourcing is still enabled!");
            var tempDialog = $('<div><p>cannot disable publishing because crowdsourcing is still enabled!</li></ul></div>');
            tempDialog.dialog({
                modal: true,
                title: "Experiment is Locked",
                resizable: false,
                width: 520,
                height: 100
            });
            cb(false);
            return;
        }

        var orderSubmitData = new OrderSubmitData();
        orderSubmitData.expId = this.exp_id();
        orderSubmitData.useExpLicense = null;

        uc.socket.emit('submitOrder', orderSubmitData.toJS(), function (response) {
            if (response.success) {
                self.refreshStatusFromServer(function () {
                    cb(true);
                });
            }
            else {
                console.log("error: could not transmit order data to server.");
                cb(false);
            }
        });
    }
    else {
        cb(true);
    }
};

Experiment.prototype.refreshStatusFromServer = function(cb) {
    var self = this;
    uc.socket.emit('getPublishingStates', {exp_id: self.exp_id()}, function(response){
        if (response.success) {
            var exp = response.exp;

            self.status(exp.status);
            self.exp_server_data(exp.exp_server_data);

            self.publishing_data.recruitInLibrary(exp.publishing_data.recruitInLibrary);
            self.publishing_data.recruitSecretly(exp.publishing_data.recruitSecretly);
            self.publishing_data.recruitViaCrowdsourcing(exp.publishing_data.recruitViaCrowdsourcing);
            self.publishing_data.recruitViaOwnCrowdsourcing(exp.publishing_data.recruitViaOwnCrowdsourcing);
            self.publishing_data.recruitViaCustomLink(exp.publishing_data.recruitViaCustomLink);

            cb();
        }
    });
};

Experiment.prototype.switchToCreateState = function(cb) {
    var self = this;

    // need to disable all recruiting options first:
    this.stopPublishExp(function (success) {
        if (success) {
            // this is an async callback because we need to wait for the confirmation by server that experiment is unpublished
            uc.socket.emit('deleteAllRecsOfExpAndSwitchToCreate', {exp_id: self.exp_id()}, function (response) {
                if (response.success) {
                    self.status("create");
                    self.saveExpData(cb);
                }
                else {
                    console.log("error: could not switch experiment to create state.");
                }
            });
        }
    });

};

Experiment.prototype.switchToRecordState = function(cb){
    this.status('record');
    this.saveMetaData(cb);
};

Experiment.prototype.switchToAnalyzeState = function(cb) {
    var self = this;
    // need to disable all recruiting options first:
    this.stopPublishExp(function(success) {
        if (success) {
            // this is an async callback because we need to wait for the confirmation by server that experiment is unpublished
            self.status('analyze');
            self.saveMetaData(cb);
        }
    });
};

/**
 * should be called by the ui classes after a change was made to some sub datamodels of this expData.
 */
Experiment.prototype.notifyChanged = function() {
    this.hasLocalChanges = true;

    if (!this.tempDisableAutosave) {
        // only automatically save if there is not already a saving process in transit:
        if (uc.userdata.accountSettingsData.autoSaveEnabled() && !this.changesInTransit) {
            this.saveExpData();
        }
        else {
            if (uc.userdata.accountSettingsData.ctrlZenabled()) {
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
 * This function is deprecated! Use saveExpData or savePublishingData or saveAnalysisData instead!
 * @deprecated
 */
Experiment.prototype.save = function() {
    this.saveExpData();
};

/**
 * save this experiment and send to server
 */
Experiment.prototype.saveExpData = function(cb, force) {
    var self = this;

    force = typeof force !== 'undefined' ? force : false;

    if (this.status() == "create" || force){
        console.log("save experiment " + this.exp_name() + " and send to server...");
        try {
            var serializedExp = this.toJS();
            if (uc.userdata.accountSettingsData.ctrlZenabled()) {
                this.addToHistory(serializedExp);
            }
            this.changesInTransit = true;
            this.hasLocalChanges = false;
            uc.socket.emit('updateExperiment', serializedExp, function(response){
                if (response.success){
                    self.changesInTransit = false;
                    console.log("saved experiment success");
                    if (cb) {
                        cb();
                    }
                    if (self.hasLocalChanges) {
                        // restart saving process for the new local changes that were made in the meantime
                        self.saveExpData();
                    }
                }
                else {
                    console.log("error: could not transmit experiment to server. Error Msg: "+response.error_msg);
                    $('<div><p>Error message:</p><p class="error text-danger">'+response.error_msg+'</p></div>').dialog();
                }
            });
        }
        catch (err) {

            var tempDialog = $('<div><p>Error message:</p><p class="error text-danger">'+err.message+'</p><button data-toggle="collapse" data-target="#errorDetails">Show Details</button><div id="errorDetails" style="max-height: 250px; overflow: auto;" class="collapse">'+err.stack+'</div></div>');
            tempDialog.dialog({
                modal: true,
                title: "Error Saving Experiment",
                resizable: false,
                width: 400,
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
    }
    else {
        this.startLockingDialog();
    }
};


Experiment.prototype.startLockingDialog = function() {
    var self= this;
    var tempDialog = $('<div><p>Editing this experiment is not recommended, because it is not in "create" state. In order to keep the specification of the experiment and the recorded data synchronized, it is advised to create a copy of this study if you want to change the specification. You have four options: </p><ul><li>You can delete all recordings and switch this experiment back to "create" mode.</li><li>Cancel the editing and keep everything as it is.</li><li>Force saving the experiment anyway (only if you know the risks).</li><li>You can copy this experiment and then edit the new instance.</li></ul></div>');

    var buttons = [];
    if (!this.publishing_data.recruitViaCrowdsourcing()) {
        buttons.push({
            text: "DELETE all recorded data, disable recordings and publishing",
            click: function () {
                self.switchToCreateState(function() {
                    console.log("successfully switched experiment to create state.");
                    tempDialog.dialog( "close" );
                });
            }
        });
    }

    buttons.push({
            text: "Cancel editing and reload from server",
            click: function () {
                window.location.reload(false);
                $( this ).dialog( "close" );
            }
        });

    buttons.push({
            text: "I know what I am doing and save anyway",
            click: function () {
                var force = true;
                self.saveExpData(function() {

                }, force);
                $( this ).dialog( "close" );
            }
        });

    tempDialog.dialog({
        modal: true,
        title: "Experiment is Locked",
        resizable: false,
        width: 450,
        buttons: buttons
    });
};

Experiment.prototype.saveMetaData = function(cb) {
    var saveData = {
        exp_id: this.exp_id(),
        exp_name: this.exp_name(),
        version: this.version(),
        status: this.status()
    };
    uc.socket.emit('updateExperiment', saveData, function(response){
        if (response.success){
            console.log("saved experiment meta data to server.");
            if (cb) {
                cb();
            }
        }
        else {
            console.log("error: could not transmit experiment meta data to server.");
        }
    });
};

Experiment.prototype.savePublishingData = function(cb) {
    if (this.publishing_data instanceof PublishingData){
        var saveData = {
            exp_id: this.exp_id(),
            publishing_data: this.publishing_data.toJS()
        };
        uc.socket.emit('updateExperiment', saveData, function(response){
            if (response.success){
                console.log("saved experiment publishing data to server.");
                if (cb) {
                    cb();
                }
            }
            else {
                console.log("error: could not transmit publishing data to server.");
            }
        });
    }
};

Experiment.prototype.saveAnalysisData = function(cb) {
    if (this.analysis_data instanceof AnalysisData){
        var saveData = {
            exp_id: this.exp_id(),
            analysis_data: this.analysis_data().toJS()
        };
        uc.socket.emit('updateExperiment', saveData, function(response){
            if (response.success){
                console.log("saved experiment analysis data to server.");
                if (cb) {
                    cb();
                }
            }
            else {
                console.log("error: could not transmit analysis data to server.");
            }
        });
    }
};

Experiment.prototype.savePrivateData = function(cb) {
    if (this.private_data instanceof PrivateData){
        var saveData = {
            exp_id: this.exp_id(),
            private_data: this.private_data.toJS()
        };
        uc.socket.emit('updateExperiment', saveData, function(response){
            if (response.success){
                console.log("saved experiment private data to server.");
                if (cb) {
                    cb();
                }
            }
            else {
                console.log("error: could not transmit private data to server.");
            }
        });
    }
};

/**
 * revert last step
 */
Experiment.prototype.revertLastSave = function() {
    if (uc.userdata.accountSettingsData.ctrlZenabled() && this.lastSavedJsons.length > 1) {
        console.log("revert last step");
        if (uc.currentEditorView instanceof TrialEditor) {
            // first save the current view state (which task, which trial, which frame are selected currently):
            var task_id = uc.currentEditorView.expTrialLoop().id();
            var selectedTrialType = uc.currentEditorView.selectedTrialType();
            var selectedFrameId = uc.currentEditorView.dataModel.currSelectedElement().id();

            // now revert to the last checkpoint:
            this.lastSavedJsons.pop();
            var temp = this.lastSavedJsons[this.lastSavedJsons.length - 1];
            this.fromJS(temp);
            this.setPointers();

            // now reinitialize the view to the previous state:
            var task = this.exp_data.entities.byId[task_id];
            uc.currentEditorView.setTask(task);
            uc.currentEditorView.reinitTaskView();
            // TODO: use selectedTrialType to reset the view, need to convert to new instances...
            uc.currentEditorView.dataModel.currSelectedElement(this.exp_data.entities.byId[selectedFrameId]);

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
    this.publishing_data.setPointers();
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Experiment}
 */
Experiment.prototype.fromJS = function(data) {
    var self = this;

    this.guid(data.guid);
    this.exp_id(data.exp_id);
    this.exp_name(data.exp_name);
    this.version(data.version);
    this.status(data.status);
    this.num_exp_subjects(data.num_exp_subjects);
    if (data.hasOwnProperty("add_time")) {
        this.add_time(data.add_time);
    }
    if (data.hasOwnProperty("modified_time")) {
        this.modified_time(data.modified_time);
    }
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

    if (data.hasOwnProperty("exp_run_data") && data.exp_run_data != null){
        this.exp_run_data().fromJS(data.exp_run_data);
    }

    if (data.hasOwnProperty("analysis_data") && data.analysis_data != null){
        this.analysis_data.fromJS(data.analysis_data);
    }

    if (data.hasOwnProperty("private_data") && data.private_data != null){
        this.private_data.fromJS(data.private_data);
    }

    if (data.hasOwnProperty("exp_server_data")){
        this.exp_server_data(data.exp_server_data);
    }

    if (data.hasOwnProperty("study_settings")){
        this.study_settings(data.study_settings);
    }

    if (data.hasOwnProperty("rec_session_data")) {
        this.rec_session_data = jQuery.map(data.rec_session_data, function (entityJson) {
            var instance = new RecSession(self);
            instance.fromJS(entityJson);
            return instance;
        });
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
        throw Error("cannot save exp data");
    }

    if (this.publishing_data instanceof PublishingData){
        var publishing_data_serialized = this.publishing_data.toJS();
    }
    else {
        throw Error("cannot save publishing_data");
    }

    if (this.exp_run_data() instanceof ExpRunData){
        var exp_run_data_serialized = this.exp_run_data().toJS();
    }
    else {
        throw Error("cannot save exp_run_data");
    }

    if (this.analysis_data instanceof AnalysisData){
        var analysisData_serialized = this.analysis_data.toJS();
    }
    else {
        throw Error("cannot save analysis_data");
    }

    if (this.private_data instanceof PrivateData){
        var private_data_serialized = this.private_data.toJS();
    }
    else {
        throw Error("cannot save private_data");
    }
    
    return {
        guid: this.guid(),
        exp_id: this.exp_id(),
        exp_name: this.exp_name(),
        version: this.version(),
        status: this.status(),
        add_time: this.add_time(),
        modified_time: this.modified_time(),
        exp_data: exp_data_serialized,
        publishing_data: publishing_data_serialized,
        exp_run_data: exp_run_data_serialized,
        analysis_data: analysisData_serialized,
        private_data: private_data_serialized
    };
};
