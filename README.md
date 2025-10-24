# PCF-TreeView
CanvasApp treeview control


Steps to Update Your GitHub Repository

Ensure You’re in the Correct Directory:

Open your terminal (or command prompt) and navigate to your local repository folder:
bashcd path/to/PCF-TreeView

Verify you’re in the correct directory by checking for the .git folder or running:
bashls -a
You should see files like TreeViewControl.tsx, ControlManifest.Input.xml, and package.json.


Stage the Modified Files:

Stage the updated TreeViewControl.tsx file for commit:
bashgit add src/TreeViewControl.tsx

If you modified other files (e.g., ControlManifest.Input.xml or dataTransform.ts), stage them too:
bashgit add .
This stages all modified files, but you can be specific to avoid committing unintended changes.


Verify Staged Changes:

Check which files are staged:
bashgit status

You should see src/TreeViewControl.tsx (and any other modified files) listed under “Changes to be committed.”


Commit the Changes:

Create a commit with a descriptive message:
bashgit commit -m "Update TreeViewControl.tsx to display key and label on same line with dash separator"

The message should clearly describe the change for future reference.


Push to GitHub:

Push your changes to the main branch (or the branch you’re working on, e.g., feature-branch):
bashgit push origin main

If you’re working on a different branch, replace main with your branch name (e.g., git push origin feature-branch).
If you get an authentication error, ensure you’re logged in or have a valid Personal Access Token (PAT) configured. See step 6 if needed.


Handle Authentication (if needed):

If GitHub prompts for credentials:

Username: Your GitHub username (harperjo86).
Password: Use a Personal Access Token (not your GitHub password). To create one:

Go to GitHub.com > Settings > Developer settings > Personal access tokens > Tokens (classic).
Generate a new token with repo scope.
Copy the token and use it as your password when prompted.




Alternatively, configure SSH keys for passwordless pushes:

Follow GitHub’s guide: Adding a new SSH key to your GitHub account.
Update your repo’s remote URL to use SSH:
bashgit remote set-url origin git@github.com:harperjo86/PCF-TreeView.git





Verify the Update on GitHub:

Visit https://github.com/harperjo86/PCF-TreeView in your browser.
Check the src/TreeViewControl.tsx file to confirm the updated code is present.
Look at the commit history to see your latest commit.


Optional: Create a Pull Request (if working on a branch):

If you pushed to a feature branch (e.g., feature-branch), create a pull request (PR) to merge into main:

Go to your repo on GitHub.
Click the “Pull requests” tab > “New pull request.”
Select feature-branch as the source and main as the target.
Review the changes, add a description, and click “Create pull request.”
Merge the PR after review (or self-approve if you’re the sole maintainer).




Build and Deploy (if needed):

If this update is for a Power Apps PCF control, rebuild the project:
bashnpm run build

Update your Power Apps solution:

Export the solution from your dev environment.
Update the PCF control bundle in the solution.
Import the solution into your target environment.


Test the updated control in your Canvas App to ensure it still works as expected.
************************************************************************
How to use changedRows in Power Apps

changedRows contains one line per changed record, e.g.:
1-1-1-1|true
1-1-1|false
In your Canvas app you can consume it and patch the collection easily. Example formula (Canvas) to apply each changed line to a collection named MyItems where field Key is the item key and isSelected is the two-options field:

---
Option A — Apply (Button) pattern

Use this when you want the user to confirm changes (recommended when programmatic changes to a TextInput won't trigger OnChange). Put a Button on the screen named `btnApplyChanges`. The button's OnSelect should read the control output (e.g. `MyTreeView.ChangedRows`) and apply updates to your collection.

Example (Button OnSelect) — update an in-memory collection `MyItems` where `Key` is the primary key and `isSelected` is the two-options field:

ForAll(
	Filter(Split(MyTreeView.ChangedRows, Char(10)), Result <> ""),
	With({ parts: Split(Result, "|") },
		UpdateIf(
			MyItems,
			Key = First(parts).Result,
			{ isSelected: Last(parts).Result = "true" }
		)
	)
)

If you want to persist immediately to a data source (e.g. Dataverse), replace `UpdateIf` with `Patch`:

ForAll(
	Filter(Split(MyTreeView.ChangedRows, Char(10)), Result <> ""),
	With({ parts: Split(Result, "|") },
		Patch(
			MyDataverseTable,
			LookUp(MyDataverseTable, Key = First(parts).Result),
			{ isSelected: Last(parts).Result = "true" }
		)
	)
)

Notes:
- Use the Apply button when you want explicit user confirmation, or when your app can't rely on programmatic OnChange events.
- This approach avoids race conditions and is easy to debug.

---
Option B — Timer auto-sync pattern

Use a Timer when you want near-real-time automatic application of the `changedRows` delta. Add a `Timer` control (e.g. `tmrApply`) with `Repeat` = true, `AutoStart` = true, and a reasonable `Duration` (ms) such as 2000 for 2s polling.

Implementation notes:
- Keep a screen-level variable to remember the last applied `changedRows` so you don't re-apply the same changes repeatedly.
- Use the Timer's `OnTimerEnd` to compare and apply only when the value changed.

Example setup:

// OnVisible of the screen
Set(varLastAppliedChangedRows, "");

// Timer properties
// Duration: 2000
// AutoStart: true
// Repeat: true

// OnTimerEnd:
If(
	!IsBlank(MyTreeView.ChangedRows) && MyTreeView.ChangedRows <> varLastAppliedChangedRows,
	// apply diffs
	With({ _d: MyTreeView.ChangedRows },
		ForAll(
			Filter(Split(_d, Char(10)), Result <> ""),
			With({ parts: Split(Result, "|") },
				UpdateIf(
					MyItems,
					Key = First(parts).Result,
					{ isSelected: Last(parts).Result = "true" }
				)
			)
		)
	);
	// remember what we applied so we don't repeat
	Set(varLastAppliedChangedRows, MyTreeView.ChangedRows)
)

Notes:
- Timer-based polling is convenient but be mindful of frequency and performance (lower frequency for large data sets).
- Protect against re-applying identical diffs by storing the last-applied string (as shown).
- If your app needs stricter guarantees or wants to trigger flows, consider calling a Power Automate flow from the Timer or Button instead.

---
Alternative: Power Automate

If you prefer server-side processing, call a Power Automate flow from your app (Button or Timer), pass `ChangedRows` as a parameter, and let the flow parse and update the data source.

---
Summary

The control exposes:
- `selectedKeys` — comma-separated list of selected keys (full state).
- `changedRows` — newline-separated delta lines, e.g. `1-1-1-1|true`.

Recommended integration patterns:
- Use an Apply Button for explicit user confirmation and minimal surprises.
- Use a Timer for automatic near-real-time sync but guard against duplicate application.
- Use Power Automate for centralized / server-side handling.

If you'd like, I can also add a small Canvas sample app (.msapp) or a short GIF showing the Apply button flow.