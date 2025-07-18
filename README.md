# Show-and-Tell-Assignment-System

This Google Apps Script automates the process of randomly assigning two names from a source sheet to each date in a target sheet. It's used to create a random schedule for a show and tell sessions.

## Key Features

* **Random Assignment:** Randomly selects two unique names for each date.

* **Configurable Sheets:** Easily specify the source sheet containing names and the target sheet for assignments.

* **Prevents Duplicates (per date):** Ensures that the two names assigned to a single date are always different.

* **Simple to Use:** Once set up, the script gets triggered automatically whenever a date is added.

* **Automatic New Addition:** Each time a new date is added, the names populate automatically.

* **Remove Names:** If someones wants their name removed, upon deletion a new name gets assigned.

## How It Works

The script operates by:

1. Reading a list of names from a designated "Source" sheet.

2. Identifying empty rows in a specified "Target" sheet.

3. For each row, it randomly picks two distinct names from the source list.

4. These two names are then written into the cells adjacent to the respective date in the target sheet.

## Setup & Installation

Follow these steps to integrate and run the script in your Google Sheet:

1. **Open your Google Sheet:** Go to the Google Sheet where you want to use this script.

2. **Open Apps Script Editor:**

   * Click on `Extensions` in the top menu.

   * Select `Apps Script`. This will open a new browser tab with the Apps Script editor.

3. **Paste the Script:**

   * In the Apps Script editor, you'll see a file named `Code.gs` (or similar).

   * Delete any existing default code in `Code.gs`.

   * Paste your entire Apps Script code into this file.

4. **Save the Script:** Click the floppy disk icon (Save project) or press `Ctrl + S` (Windows/Linux) / `Cmd + S` (Mac). You might be prompted to name your project; give it a descriptive name like "Random Name Assigner".

5. **Configure Sheet Names (Important!):**

   * **Source Sheet:** Ensure you have a sheet in your Google Sheet that contains the list of names you want to assign. Let's say it's named `Names`.

   * **Target Sheet:** Ensure you have another sheet where you want the names to be assigned next to dates. Let's say it's named `Schedule`.

   * **Modify the Script:** In your pasted script, find the lines where sheet names are defined (they might look something like `const sheetName = 'Names' `). **Update these lines** to match the exact names of your source and target sheets.

6. **Grant Permissions:**

   * The first time you run the script, Google will ask for your permission to access your Google Sheet.

   * Click `Review permissions` or `Continue`.

   * Select your Google account.

   * Click `Allow` to grant the necessary permissions. This is a one-time step.

6. **Set Up Triggers:**

   * Click on `Triggers` in left menu

   * Click on `+ New Trigger` at the bottom right

   * Set the following up:

        * Choose the function `dumpInSheet`

        * Select event type as `on edit` and save it

        * do the same with the function `nameRemoval`

   * Click `Allow` to grant the necessary permissions. This is a one-time step.

## 🏃 Usage

Once the script is set up and configured:

1. **Prepare your Sheets:**

   * **Source Sheet:** Make sure your source sheet (e.g., `Names`) has a column with all the names you want to use. Don't add Headers here, just a column of names

   * **Target Sheet:** Ensure your target sheet (e.g., `Schedule`) has a column with dates. The script will look for dates and assign names in the adjacent columns.

2. **Run the Script:**

   * Running this in the Apps Script editor directly will produce an error, instead try adding a new row with just a date in the target sheet. It will automatically fill all new rows
