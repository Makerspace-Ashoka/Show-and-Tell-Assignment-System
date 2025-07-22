// Function to get a single random name from the "Names" sheet
function randomAssign(num, data) {
  if (num === 0) {
    Logger.log("[randomAssign] Error: No names available for random assignment. num = 0");
    return null;
  }
  const ind = Math.floor(Math.random() * num);
  return data[ind][0];
}

// Function to retrieve all names from the "Names" sheet
function getNames() {
  const sheetName = "Names";
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    Logger.log(`[getNames] Sheet "${sheetName}" not found. Returning empty array.`);
    return [[], 0];
  }

  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    Logger.log(`[getNames] Sheet "${sheetName}" is empty. Returning empty array.`);
    return [[], 0];
  }

  const data = sheet.getRange(1, 1, lastRow, 1).getValues();
  const filteredData = data.filter(row => String(row[0] || "").trim() !== "");
  const num = filteredData.length;

  return [filteredData, num];
}


// This function will prioritize checking the provided list first
function nameChecker(sheet, currentRow, name, numRowsToLookBack, alreadyChosenNamesInThisBatch) {
  const nameToSearch = name.trim();

  if (!nameToSearch) {
    Logger.log("[nameChecker] Name to search is empty after trim. Returning false.");
    return false;
  }

  // --- Check against names already chosen in THIS batch first ---
  if (alreadyChosenNamesInThisBatch && alreadyChosenNamesInThisBatch.includes(nameToSearch)) {
    return true; // Found in current batch
  }

  // --- Then check against names actually in previous rows on the sheet ---
  const rowToStartSearch = Math.max(1, currentRow - numRowsToLookBack);

  if (rowToStartSearch >= currentRow){
    Logger.log("[nameChecker] No previous rows on sheet to check. Returning false.");
    return false;
  }

  const rowsToSearch = currentRow - rowToStartSearch;
  
  try {
    const prevNameRange = sheet.getRange(rowToStartSearch, 2, rowsToSearch, 2); // Read B and C
    const prevNames2D = prevNameRange.getValues();

    const prevNames1D = [];
    prevNames2D.forEach(row => {
      if (row[0] !== undefined && row[0] !== null && String(row[0]).trim() !== "") {
        prevNames1D.push(String(row[0]).trim());
      }
      if (row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== "") {
        prevNames1D.push(String(row[1]).trim());
      }
    });

    const foundInSheet = prevNames1D.includes(nameToSearch);
    return foundInSheet;

  } catch (e) {
    return false;
  }
}


// --- Main onEdit Trigger Function to fill empty B/C columns ---
function dumpInSheet(e) {
  const sheetName = "Schedule";
  const sheet = e.source.getSheetByName(sheetName);

  if (!sheet || e.range.getSheet().getName() !== sheetName) {
    Logger.log("Edit was not on the 'Schedule' sheet or sheet not found. Exiting.");
    return;
  }

  const editedRange = e.range; // This is the MULTI-CELL range if dragged
  const editedColumn = editedRange.getColumn();
  const editedRowStart = editedRange.getRow(); // Start row of the edited range
  const editedRowEnd = editedRange.getLastRow(); // End row of the edited range


  // Ensure we have names to work with
  const [namesData, numNames] = getNames();
  if (numNames < 2) {
    Logger.log("Not enough unique names in 'Names' sheet. Cannot proceed with assignments.");
    return;
  }

  const lastSheetRow = sheet.getLastRow();
  const rowsToProcessInBatch = []; // For Step 1: filling other rows
  const updatesForEditedRange = []; // For Step 2: filling edited rows

  // --- Collection of names generated in THIS execution of dumpInSheet ---
  const namesGeneratedInThisExecution = new Set(); // Use a Set for efficient checking

  // --- Step 1: Fill existing rows with empty B/C columns (excluding the edited range) ---
  if (lastSheetRow > 0) {
    const fullSheetValues = sheet.getRange(1, 1, lastSheetRow, 3).getValues(); // Read A, B, C

    for (let r = 0; r < fullSheetValues.length; r++) {
      const currentRowNum = r + 1;
      const rowData = fullSheetValues[r];

      const colAValue = rowData[0];
      const colBValue = rowData[1];
      const colCValue = rowData[2];

      const isColA_Filled = (colAValue !== undefined && String(colAValue).trim() !== "");
      const isColB_Empty = (colBValue === "" || colBValue === undefined || String(colBValue).trim() === "");
      const isColC_Empty = (colCValue === "" || colCValue === undefined || String(colCValue).trim() === "");

      // Check if this row matches criteria AND is NOT part of the currently edited range in Column A
      const isPartOfEditedRangeInColA = (editedColumn === 1 && currentRowNum >= editedRowStart && currentRowNum <= editedRowEnd);

      if (isColA_Filled && isColB_Empty && isColC_Empty && !isPartOfEditedRangeInColA) {
        
        let name1;
        let name2;
        let attempts;

        // Generate name1, ensuring it's not in the previous 3 rows AND not in current batch
        do {
          name1 = randomAssign(numNames, namesData);
        } while (namesGeneratedInThisExecution.has(name1) || nameChecker(sheet, currentRowNum, name1, 3)); // Pass the Set

        // Generate name2, ensuring it's different from name1, not in previous 3 rows, AND not in current batch
        do {
          name2 = randomAssign(numNames, namesData);
        } while (name1 === name2 || namesGeneratedInThisExecution.has(name2) || nameChecker(sheet, currentRowNum, name2, 3)); // Pass the Set

        // Add the generated names to the Set for subsequent checks in THIS execution
        if (name1) namesGeneratedInThisExecution.add(name1);
        if (name2) namesGeneratedInThisExecution.add(name2);

        rowsToProcessInBatch.push({
          row: currentRowNum,
          data: [name1, name2]
        });
      }
    }

    if (rowsToProcessInBatch.length > 0) {
      rowsToProcessInBatch.sort((a, b) => a.row - b.row);
      rowsToProcessInBatch.forEach(item => {
        sheet.getRange(item.row, 2, 1, 2).setValues([item.data]);
      });
    }
  }

  // --- Step 2: Process the specifically edited range in Column A ---
  if (editedColumn === 1) { // Only process if the edit was in Column A

    const editedRowsData = editedRange.getValues(); // Get all values from the multi-cell edited range

    for (let r = 0; r < editedRowsData.length; r++) {
      const currentRowNum = editedRowStart + r; // Calculate the actual sheet row number
      const currentEditedAValue = editedRowsData[r][0]; // Value in Column A for this specific row in the edited range

      // Read current B and C values for this specific row (important to get post-edit state)
      const currentBCValues = sheet.getRange(currentRowNum, 2, 1, 2).getValues()[0];
      const colBValue = currentBCValues[0];
      const colCValue = currentBCValues[1];

      const isColA_Filled = (currentEditedAValue !== undefined && String(currentEditedAValue).trim() !== "");
      const isColB_Empty = (colBValue === "" || colBValue === undefined || String(colBValue).trim() === "");
      const isColC_Empty = (colCValue === "" || colCValue === undefined || String(colCValue).trim() === "");

      if (isColA_Filled && isColB_Empty && isColC_Empty) {

        let name1;
        let name2;

        // Generate name1, ensuring it's not in the previous 3 rows AND not in current batch
        do {
          name1 = randomAssign(numNames, namesData);
        } while (namesGeneratedInThisExecution.has(name1) || nameChecker(sheet, currentRowNum, name1, 3)); // Pass the Set

        // Generate name2, ensuring it's different from name1, not in previous 3 rows, AND not in current batch
        do {
          name2 = randomAssign(numNames, namesData);
        } while (name1 === name2 || namesGeneratedInThisExecution.has(name2) || nameChecker(sheet, currentRowNum, name2, 3));

        // Add the generated names to the Set for subsequent checks in THIS execution
        if (name1) namesGeneratedInThisExecution.add(name1);
        if (name2) namesGeneratedInThisExecution.add(name2);

        updatesForEditedRange.push({
          row: currentRowNum,
          data: [name1, name2]
        });
      }
    }

    if (updatesForEditedRange.length > 0) {
        updatesForEditedRange.sort((a,b) => a.row - b.row);
        updatesForEditedRange.forEach(item => {
            sheet.getRange(item.row, 2, 1, 2).setValues([item.data]);
        });
    } 
  }
}


// --- Function to handle name removals from Column B or C ---
function nameRemoval(e) {

  const scheduleSheetName = "Schedule";
  const scheduleSheet = e.source.getSheetByName(scheduleSheetName);

  if (!scheduleSheet || e.range.getSheet().getName() !== scheduleSheetName) {
    Logger.log("Edit was not on the 'Schedule' sheet. Exiting nameRemoval.");
    return;
  }

  const editedRange = e.range;
  const editedColumn = editedRange.getColumn();
  const editedRow = editedRange.getRow();
  const newValue = e.value;
  const oldValue = e.oldValue;


  if (editedColumn === 2 || editedColumn === 3) {
    const wasValuePresent = (oldValue !== undefined && String(oldValue).trim() !== "");
    const isValueNowEmpty = (newValue === undefined || String(newValue).trim() === "");

    if (wasValuePresent && isValueNowEmpty) {
      const [namesData, numNames] = getNames();

      if (numNames < 1) {
        Logger.log("Cannot generate new name: No names available in 'Names' sheet. Aborting regeneration.");
        return;
      }

      const newName = randomAssign(numNames, namesData);

      if (newName) {
        scheduleSheet.getRange(editedRow, editedColumn).setValue(newName);
      } else {
        Logger.log(`Failed to generate a new name (randomAssign returned null).`);
      }

    }

  }
}