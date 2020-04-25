/**
 * Created by cgoeke on 06.01.2017.
 */


var SessionTimeData = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.type = "SessionTimeSettings";
    this.startCondition = ko.observable('anytime');
    this.startTime = ko.observable("00:00");
    this.endTime = ko.observable("23:59");
    this.startDay = ko.observable(null);
    this.endDay = ko.observable(null);
    this.startInterval = ko.observable(null);
    this.possibleIntervals = ko.observableArray(['every day', 'every week', 'every month']);
    this.minimalDaysAfterLast = ko.observable(0);
    this.maximalDaysAfterLast = ko.observable(1);



    // deprecated

    //  this.periodStartOption  = ko.observable('specific');
    // this.possibleMonthDays  = ko.observableArray(['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th','13th','14th','15th','16th','17th','18th','19th','20th','21st','22th','23th','24th','25th','26th','27th','28th','29th','30th','31th']);
    //  this.possibleWeekDays  = ko.observableArray(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']);
    //  this.startWeekDay = ko.observable(null);
    //  this.endWeekDay = ko.observable(null);
    //  this.startMonthDay = ko.observable(null);
    //  this.endMonthDay  = ko.observable(null);
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
SessionTimeData.prototype.setPointers = function (entitiesArr) {

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
SessionTimeData.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ExpSession}
 */
SessionTimeData.prototype.fromJS = function (data) {
    this.id(data.id);
    this.startCondition(data.startCondition);
    this.startTime(data.startTime);
    this.endTime(data.endTime);

    if (!this.startTime()) {
        this.startTime("00:00");
    }
    if (!this.endTime()) {
        this.endTime("23:59");
    }

    this.startDay(data.startDay);
    this.endDay(data.endDay);
    this.startInterval(data.startInterval);
    this.minimalDaysAfterLast(data.minimalDaysAfterLast);
    this.maximalDaysAfterLast(data.maximalDaysAfterLast);
    this.possibleIntervals(data.possibleIntervals);


    // this.periodStartOption(data.periodStartOption);
    // this.possibleMonthDays(data.possibleMonthDays);
    // this.possibleWeekDays(data.possibleWeekDays);
    // this.startWeekDay(data.startWeekDay) ;
    // this.endWeekDay(data.endWeekDay) ;
    // this.startMonthDay(data.startMonthDay) ;
    // this.endMonthDay(data.endMonthDay);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
SessionTimeData.prototype.toJS = function () {

    return {
        id: this.id(),
        type: this.type,
        startCondition: this.startCondition(),
        startTime: this.startTime(),
        endTime: this.endTime(),
        startDay: this.startDay(),
        endDay: this.endDay(),
        startInterval: this.startInterval(),
        possibleIntervals: this.possibleIntervals(),
        minimalDaysAfterLast: this.minimalDaysAfterLast(),
        maximalDaysAfterLast: this.maximalDaysAfterLast()

        //  possibleMonthDays: this.possibleMonthDays(),
        //  possibleWeekDays: this.possibleWeekDays(),
        //  periodStartOption: this.periodStartOption(),
        //  startWeekDay: this.startWeekDay(),
        //  endWeekDay: this.endWeekDay(),
        //  startMonthDay: this.startMonthDay(),
        //  endMonthDay: this.endMonthDay()
    };

};