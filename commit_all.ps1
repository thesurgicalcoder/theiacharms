# PowerShell script to commit each untracked file with a unique message
$files = git ls-files -z --others --exclude-standard
# Split the null‑terminated list into an array
$filesArray = $files -split "\0" | Where-Object { $_ -ne '' }
foreach ($file in $filesArray) {
    # Stage the file
    git add "${file}"
    # Create a unique commit message
    $msg = "Add ${file}"
    git commit -m "$msg"
}

