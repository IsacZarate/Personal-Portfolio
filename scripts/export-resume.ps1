# Export only the freshly generated public source using Microsoft Word.
$ErrorActionPreference = 'Stop'
$taskRepo = Split-Path -Parent $PSScriptRoot
$taskSource = Join-Path $taskRepo 'docs\resume\isac-zarate-resume.docx'
$taskPdf = Join-Path $taskRepo 'public\resume\isac-zarate-resume.pdf'
if (-not (Test-Path -LiteralPath $taskSource)) { throw 'Generate the public DOCX with build-resume.py first.' }
New-Item -ItemType Directory -Path (Split-Path -Parent $taskPdf) -Force | Out-Null
$taskWord = $null
$taskDocument = $null
try {
    $taskWord = New-Object -ComObject Word.Application
    $taskWord.Visible = $false
    $taskWord.DisplayAlerts = 0
    $taskWord.AutomationSecurity = 3
    $taskDocument = $taskWord.Documents.Open($taskSource, $false, $true)
    # PDF, print quality, whole document, sanitized properties, no IRM, heading bookmarks,
    # document structure tags, font fallback, and normal PDF (not PDF/A).
    $taskDocument.ExportAsFixedFormat($taskPdf, 17, $false, 0, 0, 1, 1, 0, $true, $false, 1, $true, $true, $false)
    Write-Output "Created tagged public PDF: $taskPdf"
} finally {
    if ($taskDocument) { $taskDocument.Close(0); [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($taskDocument) }
    if ($taskWord) { $taskWord.Quit(); [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($taskWord) }
}
