$html = Get-Content -Path $PSScriptRoot\dist\index.html
$js = Get-Content -Path $PSScriptRoot\dist\main.js
$css = Get-Content -Path $PSScriptRoot\dist\style.css
[string[]]$output

$outputDir = "$PSScriptRoot\dist\"

$fileNameIndex = $html.IndexOf("<!--filename-->")+1;
$outputFileName = $html[$fileNameIndex].Split(" ")[1].Split("=")[1];;

$html[$fileNameIndex] = "";
$html[($fileNameIndex-1)] = "";

$cssTarget = '<link rel="stylesheet" href="./style.css"></style>'
$jsTarget = '<script src="./main.js"></script>'

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

Remove-Variable * -ErrorAction SilentlyContinue
