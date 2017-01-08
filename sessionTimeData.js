/**
 * Created by cgoeke on 06.01.2017.
 */


var SessionTimeData= function (expData) {
    this.expData = expData;
    
    this.id = ko.observable(guid());
    this.type = "SessionTimeSettings";
    // variables for manning the timing
    this.startCondition  = ko.observable('anytime');
    this.startTime = ko.observable(null);
    this.endTime = ko.observable(null);
    this.startDay = ko.observable(null);
    this.endDay = ko.observable(null);
    this.periodStartOption  = ko.observable('specific');
    this.startWeekDay = ko.observable(null);
    this.endWeekDay = ko.observable(null);
    this.startMonthDay = ko.observable(null);
    this.endMonthDay  = ko.observable(null);
    this.startInterval  = ko.observable(null);
    this.possibleMonthDays  = ko.observableArray(['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th','13th','14th','15th','16th','17th','18th','19th','20th','21st','22th','23th','24th','25th','26th','27th','28th','29th','30th','31th']);
    this.possibleWeekDays  = ko.observableArray(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']);
    this.possibleIntervals  = ko.observableArray(['every day','every week','every month']);
    this.minimalDaysAfterLast = ko.observable(null);
    this.maximalDaysAfterLast = ko.observable(null);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ExpSession}
 */
SessionTimeData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.startCondition(data.startCondition);
    this.startTime(data.startTime);
    this.endTime(data.endTime);
    this.startDay(data.startDay);
    this.endDay(data.endDay);
    this.periodStartOption(data.periodStartOption);
    this.startWeekDay(data.startWeekDay) ;
    this.endWeekDay(data.endWeekDay) ;
    this.startMonthDay(data.startMonthDay) ;
    this.endMonthDay(data.endMonthDay);
    this.startInterval(data.startInterval) ;
    this.possibleMonthDays(data.possibleMonthDays);
    this.possibleWeekDays(data.possibleWeekDays);
    this.possibleIntervals(data.possibleIntervals);
    this.minimalDaysAfterLast(data.minimalDaysAfterLast);
    this.maximalDaysAfterLast(data.maximalDaysAfterLast);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
SessionTimeData.prototype.toJS = function() {

    return {
        id :  this.id(),
        type : this.type,
        startCondition: this.startCondition(),
        startTime: this.startTime(),
        endTime: this.endTime(),
        startDay: this.startDay(),
        endDay: this.endDay(),
        periodStartOption: this.periodStartOption(),
        startWeekDay: this.startWeekDay(),
        endWeekDay: this.endWeekDay(),
        startMonthDay: this.startMonthDay(),
        endMonthDay: this.endMonthDay(),
        startInterval: this.startInterval(),
        possibleMonthDays: this.possibleMonthDays(),
        possibleWeekDays: this.possibleWeekDays(),
        possibleIntervals:  this.possibleIntervals(),
        minimalDaysAfterLast: this.minimalDaysAfterLast(),
        maximalDaysAfterLast: this.maximalDaysAfterLast()
    };

};