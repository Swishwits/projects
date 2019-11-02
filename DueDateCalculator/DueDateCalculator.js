var issueTitle = document.getElementById('issueTitle');
var issueDesc = document.getElementById('issueDesc');
var radioSystemTime = document.getElementById('radioSystemTime');
var radioCustomTime = document.getElementById('radioCustomTime');
var calenderReportingDate = document.getElementById('calenderReportingDate');
var calenderReportingTime = document.getElementById('calenderReportingTime');
var turnaroundTime = document.getElementById('turnaroundTime');
var submitBtn = document.getElementById('submit');
var dueDateResult = document.getElementById('dueDateResult');
var currentDateTime = document.getElementById('currentDateTime');

var selectedDate;
var formattedDate;
var selectedTime;
var fixedWorkingHours = 8;
var startWorkingTime = "09:00";
var endWorkingTime = "17:00";
var minInMilliseconds = 60000;
var finalDueDate;
var startHours = parseInt(startWorkingTime.split(":")[0]);
var startMins = parseInt(startWorkingTime.split(":")[1]);
var endHours = parseInt(endWorkingTime.split(":")[0]);
var endMins = parseInt(endWorkingTime.split(":")[1]);
var timeLeft;
var hoursAllowed;
var issueName;
var radioValue;

// clicking the submit button
function submitInput() {
    radioValue = $("input[name='radioValue']:checked").val();
    issueName = issueTitle.value;
    hoursAllowed = turnaroundTime.value;
    currentDateTime.style.visibility = "visible";
    dueDateResult.style.visibility = "visible";

    if (!inputValidationCheck()) {
        currentDateTime.innerHTML = "";
        dueDateResult.innerHTML = "Error! Missing input!";
        return;
    }
    //if select system default time
    if (radioValue == "systemTimeRadio") {
        if (!isReportingTimeValid(new Date()) || !isReportingDayValid(new Date().getDay())) {
            currentDateTime.innerHTML = "";
            dueDateResult.innerHTML = "Error! Invalid date! Reporting issue is only allowed during working hours 9am - 5pm, Mon - Fri";
            return;
        }
        currentDateTime.innerHTML = "Reported on " + new Date();
        dueDateCalculation(hoursAllowed, new Date(), getTodayTime());
    }
    //if select calender time
    if (radioValue == "calenderTimeRadio") {
        selectedTime = calenderReportingTime.value;
        var futureDate = formDateObject(formattedDate, selectedTime);
        if (!isReportingTimeValid(futureDate) || !isReportingDayValid(futureDate.getDay())) {
            currentDateTime.innerHTML = "";
            dueDateResult.innerHTML = "Error! Invalid date! Reporting issue is only allowed during working hours 9am - 5pm, Mon - Fri";
            return;
        }
        currentDateTime.innerHTML = "Reporting on " + futureDate;
        dueDateCalculation(hoursAllowed, futureDate, selectedTime);
    }
}

//Calculating the due date
function dueDateCalculation(timeAllowed, reportingDate, reportingTime) {
    var minsBeforeDayEnd = (endHours - parseInt(reportingTime.split(":")[0])) * 60 + parseInt(reportingTime.split(":")[1]);
    var hoursBeforeDayEnd = (minsBeforeDayEnd / 60).toFixed(1);
    var interval = parseFloat(timeAllowed) - hoursBeforeDayEnd;

    var newDateAndTimeLeft = addFullWorkingDays(reportingDate, interval);
    var dueDate = new Date(newDateAndTimeLeft[0]);
    var adjustment = newDateAndTimeLeft[1];
    var finalDueDate = dueDateTimeAdjustment(dueDate, adjustment);

    dueDateResult.innerHTML = "Due date is on " + finalDueDate;
}

//Adjustment for due date
function dueDateTimeAdjustment(dueDate, hour) {
    var adjustedDate = dueDate
    if (hour < 0) {
        var hourAllowedInMins = parseFloat(hoursAllowed) * 60;
        var adjustHours = Math.floor(hourAllowedInMins / 60);
        var adjustMins = (hourAllowedInMins / 60 - adjustHours) * 60;
        adjustedDate.setMinutes(adjustedDate.getMinutes() + parseInt(Math.abs(adjustMins)));
        adjustedDate.setHours(adjustedDate.getHours() + parseInt(Math.abs(adjustHours)));
    }
    if (hour > 0) {
        var adjustmentInMins = hour * 60;
        var adjustHours = Math.floor(Math.abs(adjustmentInMins) / 60);
        var adjustMins = (Math.abs(adjustmentInMins) / 60 - adjustHours) * 60;
        adjustedDate.addNewDays(adjustedDate, "DayStart");
        adjustedDate.setMinutes(adjustedDate.getMinutes() + parseInt(adjustMins));
        adjustedDate.setHours(adjustedDate.getHours() + parseInt(adjustHours));
    }
    return adjustedDate;
}

function addFullWorkingDays(date, hours) {
    timeLeft = hours;
    var newDate = date;
    while (timeLeft >= fixedWorkingHours) {
        newDate = date.addNewDays(date, "DayEnd");
        timeLeft = timeLeft - fixedWorkingHours;
    }
    return [newDate, timeLeft];
}

//Get a working day, either new day, or full day
Date.prototype.addNewDays = function (date, dayType) {
    var newDate = date;
    if (dayType == "DayStart") {
        newDate.setHours(startHours, startMins);
    } else {
        newDate.setHours(endHours, endMins);
    }
    newDate.setDate(newDate.getDate() + 1);
    if (newDate.getDay() == 0) {
        return newDate.setDate(newDate.getDate() + 1);
    } else if (newDate.getDay() == 6) {
        return newDate.setDate(newDate.getDate() + 2);
    } else {
        return newDate;
    }
}

function isReportingDayValid(day) {
    if (day == 6 || day == 0)
        return false;
    else
        return true;
}

function isReportingTimeValid(date) {
    var hours = parseInt(date.getHours());
    var mins = parseInt(date.getMinutes());

    if (hours >= startHours && hours <= endHours) {
        if (hours == endHours && mins > 0) {
            return false;
        }
        return true;
    } else {
        return false;
    }
}

function minsConverter(hourString) {
    var result = parseInt(hourString.split(":")[0]) * 60 + parseInt(hourString.split(":")[1]);
    return result;
}

function formDateObject(formattedDate, selectedTime) {
    var year = parseInt(formattedDate.split("-")[0]);
    var month = parseInt(formattedDate.split("-")[1]);
    var day = parseInt(formattedDate.split("-")[2]);
    var hours = parseInt(selectedTime.split(":")[0]);
    var mins = parseInt(selectedTime.split(":")[1]);
    var date = new Date(year, month - 1, day, hours, mins);
    return date;
}

function getCalenderWeekDay() {
    var weekday = selectedDate.getDay();
    return numberDayConverter(weekday);
}

function getTodayWeekDay() {
    var systemDate = new Date();
    var weekday = systemDate.getDay();
    return numberDayConverter(weekday);
}

function getTodayTime() {
    var systemDate = new Date();
    var hour = systemDate.getHours();
    var min = systemDate.getMinutes();
    return hour + ':' + min;
}

function numberDayConverter(weekday) {
    var day = "";
    switch (weekday) {
        case 0:
            day = "Sunday";
            break;
        case 1:
            day = "Monday";
            break;
        case 2:
            day = "Tuesday";
            break;
        case 3:
            day = "Wednesday";
            break;
        case 4:
            day = "Thursday";
            break;
        case 5:
            day = "Friday";
            break;
        case 6:
            day = "Saturday";
    }
    return day;
}

function inputValidationCheck() {
    if (hoursAllowed == "" || issueName == "")
        return false;
    else if(radioValue == "calenderTimeRadio"){
        if(calenderReportingDate.value == "" || calenderReportingTime.value == "")
            return false;
        else
            return true;
    }
    else
        return true;
}

$('input[type="date"]').change(function () {
    selectedDate = new Date(this.value);
    var dd = selectedDate.getDate();
    var mm = selectedDate.getMonth() + 1;
    var yyyy = selectedDate.getFullYear();
    formattedDate = yyyy + '-' + mm + '-' + dd;
});

$('input[type=radio]').click(function () {
    var radioValue = $("input[name='radioValue']:checked").val();
    if (radioValue == "systemTimeRadio") {
        calenderReportingDate.value = "";
        calenderReportingTime.value = "";
        document.getElementById('optionReportDate').style.visibility = "hidden";
        document.getElementById('optionReportTime').style.visibility = "hidden";
    }
    if (radioValue == "calenderTimeRadio") {
        document.getElementById('optionReportDate').style.visibility = "visible";
        document.getElementById('optionReportTime').style.visibility = "visible";
    }
});






