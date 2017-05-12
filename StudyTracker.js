/////
///// Settings -------------------------------------------------------------
/////
var DATE_COLUMN = 1;
var START_COLUMN = 2;
var END_COLUMN = 3;
var DURATION_COLUMN = 4;
var CLASS_COLUMN = 5;

var CLASS_NAME_COLUMN = 19
var TIME_STUDIED_COLUMN = 20;
var MINIMUM_REMAINING_COLUMN = 21;
var MAXIMUM_REMAINING_COLUMN = 22;

var classNames = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];
var minimumMinutes = [600, 600, 900, 60, 300];//The minimum about of time that should be spent on each course
var maximumMinutes = [300, 300, 600, 300, 300];//The maximum amount of time on top of the minimum time that should be spent on each course

var sheet;

/////
///// Main -----------------------------------------------------------------
/////
function Main(){
  sheet = CurrentSheet();
  
  FillDurationCol(sheet);
  FillClassTotal(sheet);

 
  
}


/////
///// StartStop
/////
function StartStop(){
  sheet = CurrentSheet();
  
  ///
  /// Get the current time, in the format "h:MM (AM/PM)"
  ///
  var d = new Date();
  var currentTime = d.toTimeString(); 
  
  var hours = currentTime.split(":")[0];
  var minutes = currentTime.split(":")[1];
  var AMPM = "AM";
  
  var dayOfMonth = String(d).split(" ")[2];
  dayOfMonth += OrdinalEnding(dayOfMonth);
  
  if(hours > 12){
    hours -= 12;
    AMPM = "PM";
  }
  
  
  ///
  /// Get the cell that needs filling
  ///
  var startCell = sheet.getRange(1, START_COLUMN);
  var endCell = sheet.getRange(1, END_COLUMN);
  var dateCell = sheet.getRange(1, DATE_COLUMN);
  
  while(true){
    startCell = startCell.offset(1, 0);
    endCell = endCell.offset(1, 0);
    dateCell = dateCell.offset(1, 0);
    
    if(startCell.getValue() == ""){
      startCell.setValue(hours + ":" + minutes + " " + AMPM);
      dateCell.setValue(dayOfMonth);
      return;
    }
    
    if(endCell.getValue() == ""){
      endCell.setValue(hours + ":" + minutes + " " + AMPM);
      dateCell.setValue(dayOfMonth);
      Main();
      return;
    }
    
    
  }
}


/////
///// Fill Class Total ------------------------------------------------------
/////
function FillClassTotal(sheet){
  
  
  var classNameCell = sheet.getRange(1, CLASS_NAME_COLUMN);
  var timeStudiedCell = sheet.getRange(1, TIME_STUDIED_COLUMN);
  var minimumRemainingCell = sheet.getRange(1, MINIMUM_REMAINING_COLUMN);
  var maxiumRemainingCell = sheet.getRange(1, MAXIMUM_REMAINING_COLUMN);
  
  for(var i = 0; i < classNames.length; i++){
    classNameCell = classNameCell.offset(1, 0);
    timeStudiedCell = timeStudiedCell.offset(1, 0);
    minimumRemainingCell = minimumRemainingCell.offset(1, 0);
    maxiumRemainingCell = maxiumRemainingCell.offset(1, 0);
    
    
    var timeStudied = TotalClassTime(sheet, classNames[i]);
    var minTimeRemaining = 0, maxTimeRemaining = 0;
    
    if(timeStudied < minimumMinutes[i]){
      minTimeRemaining =  minimumMinutes[i] - timeStudied;
      maxTimeRemaining = maximumMinutes[i];
    }
    else{
      minTimeRemaining = 0;
      maxTimeRemaining = maxiumumMinutes[i] - (timeStudied - minimumMinutes[i]);
      
      if(maxTimeRemaining < 0){
        maxTimeRemaining = 0;
      }
    }
    
    classNameCell.setValue(classNames[i]);
    timeStudiedCell.setValue((timeStudied / 60).toFixed(2));
    minimumRemainingCell.setValue((minTimeRemaining / 60).toFixed(2));
    maxiumRemainingCell.setValue((maxTimeRemaining / 60).toFixed(2));

  }
}
  





/////
///// Total Class Time --------------------------------------------------------
/////
function TotalClassTime(sheet, className){
  // Total the duration of minutes spent studying the class with the given className in the given sheet.
  
  var durCell = sheet.getRange(1, DURATION_COLUMN);
  var classCell = sheet.getRange(1, CLASS_COLUMN);
  
  var runningTotal = 0;
  
  while(true){
    durCell = durCell.offset(1, 0);
    classCell = classCell.offset(1, 0);
    
    if(classCell.getValue() == ""){
      return runningTotal;
    }
    
    if(classCell.getDisplayValue() == className){
      runningTotal += parseInt(durCell.getDisplayValue(), 10);
    }
      
  }
  

}





/////
///// Fill Duration Col -----------------------------------------------------
/////

function FillDurationCol(sheet){
  ///
  /// Get the first cell of each column
  ///
  var durCell = sheet.getRange(1, DURATION_COLUMN);
  var startCell = sheet.getRange(1, START_COLUMN);
  var endCell = sheet.getRange(1, END_COLUMN);
  
  ///
  /// Variables for holding the length in minutes from midnight that the user started and stopped studying
  ///
  var startMinutes, endMinutes;
  
  
  ///
  /// Loop through the cells in the three columns
  ///
  while(true){
    //
    // Shift down once cell in each column
    //
    durCell = durCell.offset(1, 0);
    startCell = startCell.offset(1, 0);
    endCell = endCell.offset(1, 0);
    
    
    //
    // If we run into an empty start time cell, we're done
    //
    if(startCell.getValue() == ""){
      return;
    }
    
    //
    // Get start time
    //
    startMinutes = TimeToMinutes(startCell.getDisplayValue());
    
    //
    // If the end time cell is empty, make endMinutes - startMinutes = 0
    //
    if(endCell.getValue() == ""){
      endMinutes = startMinutes;
    }
    else{
      //
      // Otherwise calculate the difference between start and stop time normally
      //
      endMinutes = TimeToMinutes(endCell.getDisplayValue());
    }
    
    
    //
    // If the start time in minutes is greater than the end time, 
    // then start time must have taken place before midnight,
    // and end time after midnight, so wrap around to correct this
    //
    if(startMinutes > endMinutes){
      endMinutes += 60 * 24;
      
    }
    
    //
    // Fill the cell with the number of minutes that passed between the start cell and the end cell
    //
    durCell.setValue(parseInt(endMinutes - startMinutes, 10).toString());
    
  }
}






/////
///// Time To Minutes ------------------------------------------------------
/////
function TimeToMinutes(time){
  var hourMins, AMPM, hour, minutes;
  
  hourMins = time.split(" ")[0];
  AMPM = time.split(" ")[1];
  hour = parseInt(hourMins.split(":")[0], 10);
  minutes = parseInt(hourMins.split(":")[1], 10);
  
  if(AMPM == "PM" && hour != 12){
    hour += 12;
  }
  else if(AMPM == "AM" && hour == 12){
    hour = 0;
  }
  
  return hour * 60 + minutes;
}




/////
///// alert --------------------------------------------------------------
/////
function alert(msg){
  Browser.msgBox(msg);
}





/////
///// Current Sheet -------------------------------------------------------
/////
function CurrentSheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getActiveSheet();
}



/////
///// Ordinal Ending
/////
function OrdinalEnding(dayOfMonth){
  var lastDigit
  
  if(dayOfMonth.length == 2){
    lastDigit = dayOfMonth.substr(1)
  }
  else{
    lastDigit = dayOfMonth.substr(0)
  }
  
  
  if(lastDigit == "1" && dayOfMonth != "11"){
    return "st"
  }
  else if(lastDigit == "2" && dayOfMonth != "12"){
    return "nd"
  }
  else if(lastDigit == "3" && dayOfMonth != "13"){
    return "rd"
  }
  
  return "th"
}
