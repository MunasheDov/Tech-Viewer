$html = Get-Content -Path $PSScriptRoot\dist\index.html
$js = Get-Content -Path $PSScriptRoot\dist\main.js
$css = Get-Content -Path $PSScriptRoot\dist\style.css
[string[]]$output

$outputDir = "$PSScriptRoot\dist\"

$cssTarget = '<link rel="stylesheet" href="./style.css"></style>'
$jsTarget = '<script src="./main.js"></script>'


$fileNameTag = "<!-- filename="

$searchResult = $html | Select-String -Pattern $fileNameTag | Select-Object -Property LineNumber, Line

if ($searchResult) {
    $fileNameIndex = ($searchResult.LineNumber-1);
    $outputFileName = $html[$fileNameIndex].Split('"')[1];
    $html[$fileNameIndex] = "";
} else {
    "Failed to find '$fileNameTag' in index.html";
    "Add fileNameTag in the form of: $fileNameTag`"[filename]`" -->";
    return;
}


$cssIdx = $html.IndexOf($cssTarget);
$jsIdx = $html.IndexOf($jsTarget);


$output += $html[0..($cssIdx-1)];

$output += "<style>";
$output += $css;
$output += "</style>";


$output += $html[($cssIdx+1)..($jsIdx-1)];


$output += "<script>";
$output += $js;
$output += "</script>";

$output[$output.IndexOf("//# sourceMappingURL=main.js.map")] = "";


$output += $html[($jsIdx+1), $html.Length];


$output | Out-File -FilePath ($outputDir + $outputFileName)

"Successfully compiled and saved '$outputFileName'"

Remove-Variable * -ErrorAction SilentlyContinue
