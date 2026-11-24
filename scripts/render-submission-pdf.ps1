param([Parameter(Mandatory=$true)][string]$PdfPath,[Parameter(Mandatory=$true)][string]$OutputDirectory)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null=[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
$null=[Windows.Storage.StorageFolder,Windows.Storage,ContentType=WindowsRuntime]
$null=[Windows.Data.Pdf.PdfDocument,Windows.Data.Pdf,ContentType=WindowsRuntime]
$null=[Windows.Data.Pdf.PdfPageRenderOptions,Windows.Data.Pdf,ContentType=WindowsRuntime]
$genericTask=[System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethodDefinition -and $_.GetParameters().Count -eq 1 -and $_.GetGenericArguments().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
$actionTask=[System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and !$_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' } | Select-Object -First 1
function Await($operation,[type]$resultType){$task=$genericTask.MakeGenericMethod($resultType).Invoke($null,@($operation));$task.Wait();return $task.Result}
$file=Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync([IO.Path]::GetFullPath($PdfPath))) ([Windows.Storage.StorageFile])
$pdf=Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$folder=Await ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync([IO.Path]::GetFullPath($OutputDirectory))) ([Windows.Storage.StorageFolder])
for($i=0;$i -lt $pdf.PageCount;$i++){
 $page=$pdf.GetPage($i)
 $png=Await ($folder.CreateFileAsync(('page-'+($i+1)+'.png'),[Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])
 $stream=Await ($png.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)) ([Windows.Storage.Streams.IRandomAccessStream])
 $options=New-Object Windows.Data.Pdf.PdfPageRenderOptions;$options.DestinationWidth=1275
 $task=$actionTask.Invoke($null,@($page.RenderToStreamAsync($stream,$options)));$task.Wait();$stream.Dispose();$page.Dispose()
}
Write-Output ('Rendered '+$pdf.PageCount+' pages with Windows PDF renderer.')
