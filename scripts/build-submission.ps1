param([string]$BuildDirectory='',[switch]$ReportOnly,[switch]$DeckOnly,[string]$SourcePresentation='')
$ErrorActionPreference='Stop'
$project=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if(!$BuildDirectory){$BuildDirectory=Join-Path $project '.local/rubric-submission'}
$build=[IO.Path]::GetFullPath($BuildDirectory)
New-Item -ItemType Directory -Path $build,(Join-Path $build 'slides') -Force | Out-Null
$data=Get-Content -LiteralPath (Join-Path $project 'submission/source/content.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$assets=Join-Path $project 'submission/assets'
function G($o,[string]$n,[object[]]$a=@()){return ,$o.GetType().InvokeMember($n,[Reflection.BindingFlags]::GetProperty,$null,$o,$a)}
function S($o,[string]$n,$v){try{$null=$o.GetType().InvokeMember($n,[Reflection.BindingFlags]::SetProperty,$null,$o,@($v))}catch{throw ('Set '+$n+' at '+$script:stage+' type '+$v.GetType().Name+': '+$_.Exception.Message+"`n"+$_.ScriptStackTrace)}}
function M($o,[string]$n,[object[]]$a=@()){try{return ,$o.GetType().InvokeMember($n,([Reflection.BindingFlags]::InvokeMethod -bor [Reflection.BindingFlags]::OptionalParamBinding),$null,$o,$a)}catch{throw ('COM '+$n+' at '+$script:stage+': '+$_.Exception.Message)}}
function RGB([string]$h){return [Convert]::ToInt32($h.Substring(0,2),16)+256*[Convert]::ToInt32($h.Substring(2,2),16)+65536*[Convert]::ToInt32($h.Substring(4,2),16)}
$navy=RGB '0F1B3D';$blue=RGB '1556BC';$green=RGB '087443';$red=RGB 'C8102E';$amber=RGB '9A5600';$gold=RGB 'F5A623';$white=RGB 'FFFFFF';$calm=RGB 'F5F8FF';$muted=RGB '506078';$line=RGB 'E6EAF2'
$script:fitWarnings=@();$script:slideIndex=0
Add-Type -AssemblyName System.Drawing
function T($slide,[string]$text,[double]$x,[double]$y,[double]$w,[double]$h,[double]$size,[int]$color,[bool]$bold=$false){
 $shape=M (G $slide 'Shapes') 'AddTextbox' @(1,[single]$x,[single]$y,[single]$w,[single]$h)
 $frame=G $shape 'TextFrame';foreach($p in @('MarginLeft','MarginRight','MarginTop','MarginBottom')){S $frame $p 0};S $frame 'WordWrap' -1
 $range=G $frame 'TextRange';S $range 'Text' $text;$font=G $range 'Font';S $font 'Name' 'Segoe UI';S $font 'Size' $size;S $font 'Bold' $(if($bold){-1}else{0});S (G $font 'Color') 'RGB' $color
 $pf=G $range 'ParagraphFormat';S $pf 'SpaceAfter' 0
 if((G $range 'BoundHeight') -gt $h+3){$script:fitWarnings+=('Slide '+$script:slideIndex+': '+$text)}
 return ,$shape
}
function Rect($slide,[double]$x,[double]$y,[double]$w,[double]$h,[int]$color){$shape=M (G $slide 'Shapes') 'AddShape' @(1,[single]$x,[single]$y,[single]$w,[single]$h);S (G $shape 'Line') 'Visible' 0;$f=G $shape 'Fill';$null=M $f 'Solid';S (G $f 'ForeColor') 'RGB' $color;return ,$shape}
function Pic($slide,[string]$path,[double]$x,[double]$y,[double]$w,[double]$h,[string]$name){
 $im=[Drawing.Image]::FromFile($path);try{$scale=[Math]::Min($w/$im.Width,$h/$im.Height);$iw=$im.Width*$scale;$ih=$im.Height*$scale}finally{$im.Dispose()}
 $shape=M (G $slide 'Shapes') 'AddPicture' @($path,0,-1,[single]($x+($w-$iw)/2),[single]($y+($h-$ih)/2),[single]$iw,[single]$ih);S $shape 'Name' $name;S $shape 'AlternativeText' $name;return ,$shape
}
function ClosingPic($slide,[string]$path,[double]$x,[double]$y,[double]$boxWidth,[double]$boxHeight,[double[]]$viewport,[string]$name){
 # Native, reversible picture crops remove only the phone chrome and old footer.
 $im=[Drawing.Image]::FromFile($path);try{$sourceWidth=$im.Width;$sourceHeight=$im.Height}finally{$im.Dispose()}
 $scale=[Math]::Min($boxWidth/$viewport[2],$boxHeight/$viewport[3]);$w=$viewport[2]*$scale;$h=$viewport[3]*$scale
 $shape=M (G $slide 'Shapes') 'AddPicture' @($path,[int]0,[int]-1,[single]0,[single]0,[single]($sourceWidth*$scale),[single]($sourceHeight*$scale))
 $crop=G (G $shape 'PictureFormat') 'Crop'
 S $crop 'PictureWidth' ([single]($sourceWidth*$scale));S $crop 'PictureHeight' ([single]($sourceHeight*$scale))
 S $crop 'ShapeWidth' ([single]$w);S $crop 'ShapeHeight' ([single]$h)
 S $crop 'PictureOffsetX' ([single](($sourceWidth/2-$viewport[0]-$viewport[2]/2)*$scale));S $crop 'PictureOffsetY' ([single](($sourceHeight/2-$viewport[1]-$viewport[3]/2)*$scale))
 S $shape 'Left' ([single]($x+($boxWidth-$w)/2));S $shape 'Top' ([single]($y+($boxHeight-$h)/2))
 S $shape 'Name' $name;S $shape 'AlternativeText' $(if($name -eq 'CLOSING_EN'){'English community scam-safety advice supplied by the team'}else{'Arabic community scam-safety advice supplied by the team'})
}
function Closing($slide){
 S $slide 'FollowMasterBackground' 0;$fill=G (G $slide 'Background') 'Fill';$null=M $fill 'Solid';S (G $fill 'ForeColor') 'RGB' (RGB '112E43')
 ClosingPic $slide (Join-Path $assets 'closing/safety-en.jpg') 68 30 520 650 @(36,5,668,925) 'CLOSING_EN'
 ClosingPic $slide (Join-Path $assets 'closing/safety-ar.jpg') 692 30 520 650 @(40,15,710,905) 'CLOSING_AR'
 $notes=G (G $slide 'NotesPage') 'Shapes';$ph=M (G $notes 'Placeholders') 'Item' @(2)
 S (G (G $ph 'TextFrame') 'TextRange') 'Text' 'English and Arabic safety images supplied by the team on 24 November 2026. The original JPEGs are embedded; reversible crops remove phone chrome and the superseded brand footer. No authority endorsement or guaranteed protection is implied.'
}
function Pair($slide,[string]$screen,[double]$x=650,[double]$y=142,[double]$w=234,[double]$gap=55){
 $null=T $slide 'English' $x ($y-28) $w 25 18 $muted $true
 $null=T $slide ([string]([char]0x0627+[string][char]0x0644+[string][char]0x0639+[string][char]0x0631+[string][char]0x0628+[string][char]0x064A+[string][char]0x0629)) ($x+$w+$gap) ($y-28) $w 25 18 $muted $true
 $null=Pic $slide (Join-Path $assets "ui/$screen-en.png") $x $y $w (844*$w/390) "UI_EN_$screen"
 $null=Pic $slide (Join-Path $assets "ui/$screen-ar.png") ($x+$w+$gap) $y $w (844*$w/390) "UI_AR_$screen"
}
function Table($slide,$rows,[double]$x,[double]$y,[double]$w,[double]$h,[double[]]$widths,[double]$fontSize=23){
 $shape=M (G $slide 'Shapes') 'AddTable' @($rows.Count,$rows[0].Count,[single]$x,[single]$y,[single]$w,[single]$h);$table=G $shape 'Table'
 for($ci=1;$ci -le $widths.Count;$ci++){S (M (G $table 'Columns') 'Item' @($ci)) 'Width' ([single]$widths[$ci-1])}
 for($ri=1;$ri -le $rows.Count;$ri++){for($ci=1;$ci -le $rows[0].Count;$ci++){
  $cell=M $table 'Cell' @($ri,$ci);$cs=G $cell 'Shape';$fill=G $cs 'Fill';$null=M $fill 'Solid';S (G $fill 'ForeColor') 'RGB' $(if($ri -eq 1){$navy}else{$white})
  $f=G $cs 'TextFrame';S $f 'MarginLeft' 14;S $f 'MarginRight' 14;S $f 'MarginTop' 11;S $f 'MarginBottom' 11
  $tr=G $f 'TextRange';S $tr 'Text' ([string]$rows[$ri-1][$ci-1]);$font=G $tr 'Font';S $font 'Name' 'Segoe UI';S $font 'Size' $fontSize;S $font 'Bold' $(if($ri -eq 1){-1}else{0});S (G $font 'Color') 'RGB' $(if($ri -eq 1){$white}else{$navy});S (G $tr 'ParagraphFormat') 'SpaceAfter' 0
 }}
 return ,$shape
}
function Arrow($slide,[double]$x1,[double]$y1,[double]$x2,[double]$y2){$s=M (G $slide 'Shapes') 'AddConnector' @(1,[single]$x1,[single]$y1,[single]$x2,[single]$y2);$l=G $s 'Line';S $l 'Weight' 3;S $l 'EndArrowheadStyle' 3;S (G $l 'ForeColor') 'RGB' $blue}

# Native Office authoring is used on this Windows host because the managed
# Spaces/Artifact runtime and packaged DOCX renderer are not available.
# Only the presentation/document created here are closed by this script.
if(!$ReportOnly){
$ppt=New-Object -ComObject PowerPoint.Application
if($SourcePresentation){$deck=M (G $ppt 'Presentations') 'Open' @([string]([IO.Path]::GetFullPath($SourcePresentation)),[int]-1,[int]0,[int]0)}else{$deck=M (G $ppt 'Presentations') 'Add' @(0)}
try{
 if($SourcePresentation){
  if((G (G $deck 'Slides') 'Count') -ne ($data.slides.Count-1)){throw 'Use the team-edited draft without its closing slide as SourcePresentation, or omit SourcePresentation to rebuild from the current source.'}
  $script:stage='append to the team-edited presentation';$count=G (G $deck 'Slides') 'Count'
  $s=M (G $deck 'Slides') 'Add' @([int]($count+1),[int]12);Closing $s
  # Deletions/reordering left static page labels from the original deck.
  for($index=1;$index -le $count;$index++){$slide=M (G $deck 'Slides') 'Item' @($index);$shapes=G $slide 'Shapes';for($si=1;$si -le (G $shapes 'Count');$si++){$shape=M $shapes 'Item' @($si);if((G $shape 'Left') -gt 1200 -and (G $shape 'Top') -gt 665 -and (G $shape 'HasTextFrame') -eq -1){$tr=G (G $shape 'TextFrame') 'TextRange';if((G $tr 'Text') -match '^\d+$'){S $tr 'Text' ([string]$index)}}}}
 }else{
 $setup=G $deck 'PageSetup';S $setup 'SlideWidth' 1280;S $setup 'SlideHeight' 720
 foreach($d in $data.slides){
  $script:slideIndex++;$script:stage='slide '+$script:slideIndex+' '+$d.layout;Write-Output $script:stage;$s=M (G $deck 'Slides') 'Add' @($script:slideIndex,12);S $s 'FollowMasterBackground' 0;$fill=G (G $s 'Background') 'Fill';$null=M $fill 'Solid';S (G $fill 'ForeColor') 'RGB' $(if($d.layout -eq 'cover'){$navy}else{$calm})
  if($d.layout -eq 'bilingualClosing'){Closing $s;continue}
  if($d.layout -eq 'cover'){
   $null=T $s $d.title 60 80 1120 102 80 $white $true
   $null=T $s $d.subtitle 64 220 1120 140 46 $white $true
   $null=T $s $d.body 66 400 1080 90 28 $white
   $null=T $s ($data.team -join "`n") 66 535 900 105 25 $white
  }else{
   $null=T $s $d.title 56 34 1160 72 43 $navy $true
   switch($d.layout){
    'rubric' {$rows=@(,@('Criterion','Weight','What the MVP contributes'))+@($d.rows);$null=Table $s $rows 56 145 1168 450 @(375,120,673) 23}
    'story' {$null=T $s $d.body 60 105 530 70 22 $navy;$null=Pic $s (Join-Path $assets ('storyboards/'+$d.photo)) 60 180 440 440 ('STORY_'+$d.photo);Pair $s $d.screen 672 145 215 67;$null=T $s 'Illustrative storyboard supplied by the team' 60 628 500 28 16 $muted}
    'ui' {
     $null=T $s $d.lead 60 155 490 95 32 $green $true
     for($i=0;$i -lt $d.items.Count;$i++){$null=T $s ([string]($i+1)) 60 (300+$i*108) 40 50 31 $(if($i -eq 0){$green}elseif($i -eq 1){$amber}else{$red}) $true;$null=T $s $d.items[$i] 115 (300+$i*108) 440 96 27 $navy}
     Pair $s $d.screen
    }
    'coverage' {$rows=@(,@('Stage','Coverage','Boundary'))+@($d.rows);$null=Table $s $rows 56 145 1168 452 @(210,430,528) 23}
    'accuracy' {
     $null=T $s $d.leftTitle 60 145 540 75 34 $green $true;$null=T $s $d.rightTitle 670 145 540 110 34 $amber $true
     for($i=0;$i -lt 3;$i++){$null=T $s $d.left[$i] 60 (290+$i*102) 530 85 31 $navy;$null=T $s $d.right[$i] 670 (290+$i*102) 530 85 28 $navy}
    }
    'evaluation' {$rows=@(,@('Element','Proposed method'))+@($d.rows);$null=Table $s $rows 56 145 1168 450 @(270,898) 24}
    'architecture' {
     $names=@('Phone or browser','Node.js backend','OpenAI Responses API');$bodies=@("Local crop`nQuestions and consent","Input and output checks`nPrivate API credentials","Image transcription`nText assessment")
     for($i=0;$i -lt 3;$i++){$x=60+$i*420;$null=Rect $s $x 210 320 205 $(if($i -eq 0){$navy}elseif($i -eq 1){$green}else{$blue});$null=T $s $names[$i] ($x+20) 235 280 74 27 $white $true;$null=T $s $bodies[$i] ($x+20) 315 280 92 24 $white;if($i -lt 2){Arrow $s ($x+335) 310 ($x+400) 310}}
     $null=T $s 'Fixed external sources' 60 485 450 50 29 $navy $true;$null=T $s "ADMO RSS awareness updates`nPhishing.Database hostname reputation" 60 550 650 85 27 $navy
     $null=T $s "No submitted website is visited`nNo authority case is sent" 780 505 430 110 28 $red $true
    }
    'feasibility' {$null=T $s $d.lead 60 150 1100 80 44 $green $true;for($i=0;$i -lt $d.items.Count;$i++){$null=T $s $d.items[$i] 60 (275+$i*82) 1120 70 29 $navy}}
    'closing' {for($i=0;$i -lt $d.items.Count;$i++){$null=T $s ([string]($i+1)) 60 (145+$i*110) 45 60 36 $green $true;$null=T $s $d.items[$i] 125 (150+$i*110) 770 90 31 $navy};$null=Pic $s (Join-Path $assets 'repository-qr.png') 960 200 240 240 'Repository QR';$null=T $s 'Public source on GitHub' 920 470 310 60 24 $blue $true}
   }
   if($d.note){$null=T $s $d.note 56 664 1125 46 16 $muted}
  }
  $null=T $s ([string]$script:slideIndex) 1210 675 42 26 15 $(if($d.layout -eq 'cover'){$white}else{$muted})
  $notes=G (G $s 'NotesPage') 'Shapes';$ph=M (G $notes 'Placeholders') 'Item' @(2);$nr=G (G $ph 'TextFrame') 'TextRange'
  S $nr 'Text' ($d.note+"`r`rEvidence: current app source bb0a74d, README and captured UI, 24 November 2026. Judging weights supplied by the team. Storyboards are user-supplied illustrations. Sources: https://www.mediaoffice.abudhabi/en/rss-news-feeds-abu-dhabi-media-office/ ; https://srv.adpolice.gov.ae/en/aman/pages/qa.aspx ; https://developers.openai.com/api/docs/guides/structured-outputs ; https://expo.dev/changelog/expo-go-loading-changes-may-2026")
 }
 }
 $script:stage='presentation export'
 $null=M $deck 'SaveAs' @([string](Join-Path $build 'TAAKAD_Judges_Presentation.pptx'),[int]24,[int]0)
 $null=M $deck 'Export' @([string](Join-Path $build 'slides'),[string]'PNG',[int]1600,[int]900)
 $null=M $deck 'SaveAs' @([string](Join-Path $build 'presentation.pdf'),[int]32,[int]0)
 Write-Output ('PowerPoint slides: '+(G (G $deck 'Slides') 'Count'))
}finally{$null=M $deck 'Close'}
[IO.File]::WriteAllLines((Join-Path $build 'slide-fit-warnings.txt'),[string[]]$script:fitWarnings)
}
if($DeckOnly){return}

$script:stage='Word startup'
$word=New-Object -ComObject Word.Application;S $word 'Visible' $false;S $word 'DisplayAlerts' 0
$doc=M (G $word 'Documents') 'Add';$sel=G $word 'Selection'
$script:pictureTables=@()
function Para([string]$text,[int]$style=-1){S $sel 'Style' $style;$null=M $sel 'TypeText' @($text.Replace("`n","`v"));$null=M $sel 'TypeParagraph'}
function CoverPara([string]$text,[double]$size,[int]$color,[bool]$bold,[double]$before,[double]$after,[int]$style=-1){
 S $sel 'Style' $style;$font=G $sel 'Font';S $font 'Name' 'Segoe UI';S $font 'Size' $size;S $font 'Color' $color;S $font 'Bold' $(if($bold){-1}else{0})
 $pf=G $sel 'ParagraphFormat';S $pf 'SpaceBefore' $before;S $pf 'SpaceAfter' $after;S $pf 'Alignment' 0;S $pf 'ReadingOrder' 1;S $pf 'KeepWithNext' 0
 $null=M $sel 'TypeText' @($text.Replace("`n","`v"));$null=M $sel 'TypeParagraph'
}
function CoverBackground($section){
 $header=M (G $section 'Headers') 'Item' @(2);$shapes=G $header 'Shapes'
 foreach($spec in @(@('Cover background',0,0,595.3,841.9,'0F1B3D'),@('Green edge',573.3,0,22,841.9,'087443'),@('Red accent',573.3,720,22,121.9,'C8102E'))){
  $shape=M $shapes 'AddShape' @([int]1,[single]$spec[1],[single]$spec[2],[single]$spec[3],[single]$spec[4]);S $shape 'Name' $spec[0]
  S $shape 'RelativeHorizontalPosition' 1;S $shape 'RelativeVerticalPosition' 1;S $shape 'Left' ([single]$spec[1]);S $shape 'Top' ([single]$spec[2]);S (G $shape 'WrapFormat') 'Type' 5;S (G $shape 'Line') 'Visible' 0
  $fill=G $shape 'Fill';$null=M $fill 'Solid';S (G $fill 'ForeColor') 'RGB' (RGB $spec[5])
 }
}
function AfterTable($table){$e=G (G $table 'Range') 'End';$r=M $doc 'Range' @([int]$e,[int]$e);$null=M $r 'Select';$null=M $sel 'TypeParagraph'}
function WTable($rows,$widths){
 $t=M (G $doc 'Tables') 'Add' @((G $sel 'Range'),$rows.Count,$rows[0].Count);S $t 'AllowAutoFit' $false
 S $t 'TopPadding' 5;S $t 'BottomPadding' 5;S $t 'LeftPadding' 7;S $t 'RightPadding' 7
 $b=G $t 'Borders';S $b 'Enable' 1;S $b 'OutsideColor' $line;S $b 'InsideColor' $line
 $tr=G $t 'Range';S (G $tr 'Font') 'Size' 10;S (G $tr 'ParagraphFormat') 'SpaceAfter' 3;S (G $tr 'ParagraphFormat') 'SpaceBefore' 0
 for($ci=1;$ci -le $widths.Count;$ci++){S (M (G $t 'Columns') 'Item' @($ci)) 'Width' ([single]$widths[$ci-1])}
 S (G $t 'Rows') 'AllowBreakAcrossPages' 0
 for($ri=1;$ri -le $rows.Count;$ri++){for($ci=1;$ci -le $rows[0].Count;$ci++){$cell=M $t 'Cell' @($ri,$ci);S (G $cell 'Range') 'Text' ([string]$rows[$ri-1][$ci-1]);S $cell 'VerticalAlignment' 1;if($ri -eq 1){S (G $cell 'Shading') 'BackgroundPatternColor' $line;S (G (G $cell 'Range') 'Font') 'Bold' ([int]-1)}}}
 AfterTable $t
}
function WPair([string]$screen,[double]$pictureWidth=157){
 $t=M (G $doc 'Tables') 'Add' @((G $sel 'Range'),1,2);S $t 'AllowAutoFit' $false;S (G $t 'Borders') 'Enable' 0;S (G $t 'Rows') 'AllowBreakAcrossPages' 0
 $script:pictureTables+=,$t
 for($i=1;$i -le 2;$i++){
  S (M (G $t 'Columns') 'Item' @($i)) 'Width' ([single]247.5);$cell=M $t 'Cell' @(1,$i);$r=G $cell 'Range';S $r 'Text' $(if($i -eq 1){"English`r"}else{"Arabic`r"});S (G $r 'ParagraphFormat') 'Alignment' 1
  $r=G $cell 'Range';S $r 'End' ((G $r 'End')-1);$null=M $r 'Collapse' @(0)
  $name=if($i -eq 1){'en'}else{'ar'};$im=M (G $doc 'InlineShapes') 'AddPicture' @([string](Join-Path $assets "ui/$screen-$name.png"),[bool]$false,[bool]$true,$r);S $im 'LockAspectRatio' ([int]-1);S $im 'Width' ([single]$pictureWidth);S $im 'Height' ([single]($pictureWidth*844/390))
 }
 AfterTable $t
}
try{
 $ps=G $doc 'PageSetup';S $ps 'PageWidth' ([single]595.3);S $ps 'PageHeight' ([single]841.9);foreach($name in @('TopMargin','BottomMargin','LeftMargin','RightMargin')){S $ps $name ([single]50)};S $ps 'HeaderDistance' 24;S $ps 'FooterDistance' 24;S $ps 'DifferentFirstPageHeaderFooter' ([int]-1)
 $styles=G $doc 'Styles'
 foreach($id in @(-1,-2,-3,-63)){$st=M $styles 'Item' @($id);S $st 'AutomaticallyUpdate' $false;$f=G $st 'Font';S $f 'Name' $(if($id -eq -2 -or $id -eq -63){'Cambria'}else{'Calibri'});S $f 'Color' 0;S $f 'Bold' $(if($id -eq -2 -or $id -eq -3){-1}else{0});S $f 'Size' $(switch($id){-63{48};-2{23};-3{13};default{11}});$pf=G $st 'ParagraphFormat';S $pf 'SpaceAfter' $(if($id -eq -1){8}else{12});S $pf 'SpaceBefore' $(if($id -eq -3){8}else{0});S $pf 'LineSpacingRule' 0;S $pf 'ReadingOrder' 1;S $pf 'Alignment' 0}
 $pi=0
 foreach($page in $data.pages){
  $script:stage='report page '+($pi+1)+' '+$page.title
  if($pi -gt 0){$null=M $sel 'InsertBreak' @(7)}
  if($page.cover){
   $pale=RGB 'D9E5F8';$brightGreen=RGB '73D4BB'
   CoverPara "ABU DHABI POLICE x 42 ABU DHABI`nHACKATHON 2026" 10 $pale $false 24 68
   CoverPara $page.title 64 $white $true 0 12 -63
   CoverPara $page.subtitle 29 $white $false 0 28
   CoverPara "Check suspicious messages.`nFind a safer next step." 20 $pale $false 0 54
   CoverPara 'PROJECT TEAM' 10 $brightGreen $true 0 12
   CoverPara ($data.team -join "`n") 14 $white $false 0 48
   CoverPara "AI-powered scam awareness`nArabic and English" 14 $brightGreen $false 0 22
   CoverPara '24 November 2026' 10 $pale $false 0 0
   S $sel 'Style' ([int]-1);$null=M (G $sel 'Font') 'Reset';$null=M (G $sel 'ParagraphFormat') 'Reset'
   $pi++;continue
  }else{Para $page.title -2}
  foreach($b in $page.blocks){
   if($b.h){Para $b.h -3}
   elseif($b.p){Para $b.p}
   elseif($b.table){WTable @($b.table) @($b.widths)}
   elseif($b.pair){WPair $b.pair;S $sel 'Style' ([int]-1);S (G $sel 'Font') 'Size' 9;S (G $sel 'Font') 'Color' $muted;$null=M $sel 'TypeText' @($b.caption);$null=M $sel 'TypeParagraph';S (G $sel 'Font') 'Size' 11;S (G $sel 'Font') 'Color' 0}
   elseif($b.code){S $sel 'Style' ([int]-1);S (G $sel 'Font') 'Name' 'Consolas';S (G $sel 'Font') 'Size' 11;$null=M $sel 'TypeText' @($b.code.Replace("`n","`v"));$null=M $sel 'TypeParagraph';S (G $sel 'Font') 'Name' 'Calibri'}
   elseif($b.refs){foreach($ref in $b.refs){S $sel 'Style' ([int]-1);S (G $sel 'Font') 'Size' 10;Para $ref[0];$null=M (G $doc 'Hyperlinks') 'Add' @((G $sel 'Range'),[string]$ref[1],[Type]::Missing,[Type]::Missing,[string]$ref[1]);$null=M $sel 'TypeParagraph'};S (G $sel 'Font') 'Size' 11}
  }
  $pi++
 }
 $allpf=G (G $doc 'Content') 'ParagraphFormat';S $allpf 'ReadingOrder' 1;S $allpf 'Alignment' 0
 foreach($pictures in $script:pictureTables){S (G (G $pictures 'Range') 'ParagraphFormat') 'Alignment' 1}
 $section=M (G $doc 'Sections') 'Item' @(1);$header=M (G $section 'Headers') 'Item' @(1);$hr=G $header 'Range';S $hr 'Text' 'TAAKAD    PROJECT REPORT';S (G $hr 'Font') 'Name' 'Calibri';S (G $hr 'Font') 'Size' 9;S (G $hr 'Font') 'Color' 0;S (G $hr 'ParagraphFormat') 'Alignment' 0
 CoverBackground $section
 $footer=M (G $section 'Footers') 'Item' @(1);$fr=G $footer 'Range';S $fr 'Text' '';$null=M (G $fr 'Fields') 'Add' @($fr,-1,'PAGE',$false);S (G $fr 'ParagraphFormat') 'Alignment' 2;S (G $fr 'Font') 'Size' 9;S (G $fr 'Font') 'Color' 0
 $script:stage='report export'
 $null=M $doc 'Repaginate';Write-Output ('Word pages: '+(M $doc 'ComputeStatistics' @(2)))
 $null=M $doc 'SaveAs2' @([string](Join-Path $build 'TAAKAD_Project_Report.docx'),[int]16)
 $null=M $doc 'ExportAsFixedFormat' @([string](Join-Path $build 'report.pdf'),[int]17)
}finally{$null=M $doc 'Close' @(0);$null=M $word 'Quit'}
Write-Output ('Artifacts built privately in '+$build)
