function randomAssign(num,data) {
  const ind1 = Math.floor(Math.random() * num)
  const name1 = data[ind1]

  return name1;
}


function getNames(){
  const sheetName = "Names"
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

   if (!sheet) {
    Logger.log(`Sheet "${sheetName}" not found.`);
    return;
  }

  const data = sheet.getRange(1,1,sheet.getLastRow()).getValues();
  const num = data.length;
  

  Logger.log(num);
  return [data,num];
}


function dumpInSheet(e){
  const sheetName = "Schedule"
  const sheet = e.source.getSheetByName(sheetName); 
  if (!sheet || e.range.getSheet().getName() !== sheetName) {
    Logger.log("Edit was not on the 'Schedule' sheet. Exiting.");
    return;
  }

  const editedRange = e.range;
  const editedColumn = editedRange.getColumn(); // 1 for A, 2 for B, etc.
  const editedRow = editedRange.getRow();     // The 1-indexed row number that was edited
  const editedValue = e.value;    

  if (editedColumn === 1) { 
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const [data,num] = getNames();

    const range = sheet.getRange(1, 1, lastRow, lastColumn);
    const values = range.getValues(); 
    for (let row = 1; row <= lastRow; row++) {

      if (!values[row-1][1] && !values[row-1][2]){
        const name1 = randomAssign(num,data)
        const rowData = [name1]; 
        let name2;
        do{
          name2 = randomAssign(num,data)
        } while ( name1 == name2)
        Logger.log(rowData)
        const rowDataToSet = [[name1, name2]]; // This must be a 2D array for setValues

      // Write to the specific row, starting at Column B (2), 1 row high, 2 columns wide
        sheet.getRange(row, 2, 1, 2).setValues(rowDataToSet);
      }
    }
  } else {
    Logger.log(`Edit was not in Column A. Column: ${editedColumn}. No action taken.`);
  }

}


function nameRemoval(e){
  const scheduleSheetName = "Schedule";
  const scheduleSheet = e.source.getSheetByName(scheduleSheetName);

  const editedRange = e.range;
  const editedColumn = editedRange.getColumn();
  const editedRow = editedRange.getRow();
  const newValue = e.value;     // The new value of the cell after the edit
  const oldValue = e.oldValue;  

  if (editedColumn === 2 || editedColumn === 3) {
    const [data, num] = getNames();
    let newName;
    do{
    newName = randomAssign(num, data);
    } while (newName == oldValue)

    scheduleSheet.getRange(editedRow, editedColumn).setValue(newName);
  }

}







  /*
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    Logger.log(`Sheet "${sheetName}" not found.`);
    return;
  }

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  const [data,num] = getNames();

    const range = sheet.getRange(1, 1, lastRow, lastColumn);
    const values = range.getValues(); 
    for (let row = 1; row <= lastRow; row++) {

      if (!values[row-1][1]){
        const name1 = randomAssign(num,data)
        const rowData = [name1]; 
        Logger.log(rowData)
        sheet.getRange(row,2,1,rowData.length).setValues([rowData]);
      }

      if (!values[row-1][2]){
        let name2;
        do{
          name2 = randomAssign(num,data)
        } while ( values[row-1][1] == name2)
    
        const rowData = [ name2]; 
        Logger.log(rowData)
        sheet.getRange(row,3,1,rowData.length).setValues([rowData]);
      }

      
    if (!values[row - 1][1] || !values[row - 1][2]) { // If column G is empty

      const name1 = randomAssign(num,data)
      let name2;
      do{
        name2 = randomAssign(num,data)
      } while ( name1 == name2)
    
      const rowData = [name1, name2]; 
      Logger.log(rowData)
      sheet.getRange(row,2,1,rowData.length).setValues([rowData]);
    }
  }*/





  /*
  const lRow = sheet.getLastRow()
  let i = 1;
  do{
    const [data,num] = getNames()
    const [n1,n2] = randomAssign(num,data)
    const rowData = [n1,n2]
    sheet.getRange(i,2,1,rowData.length).setValues([rowData]);
    Logger.log("Chosen Name 1: " + n1);
    Logger.log("Chosen Name 2: " + n2);
    i+=1;
  }while (i <= lRow)
 */






