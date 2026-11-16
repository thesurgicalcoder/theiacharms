# PowerShell script to commit every remaining change (modified, added, untracked) with a unique message
# Get untracked files (null‑terminated)
$untracked = git ls-files -z --others --exclude-standard
# Get modified/added files (line‑terminated)
$modified = git diff --name-only

$files = @()
if ($untracked) {
    $files += $untracked -split "\0" | Where-Object { $_ -ne '' }
}
if ($modified) {
    $files += $modified -split "\n" | Where-Object { $_ -ne '' }
}

foreach ($file in $files) {
    git add "${file}"
    $msg = "Add ${file}"
    git commit -m "$msg"
}
