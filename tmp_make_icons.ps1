Add-Type -AssemblyName System.Drawing
$sizes = 192,512
if(-not (Test-Path "client/public")){ New-Item -ItemType Directory "client/public" | Out-Null }
foreach($s in $sizes){
  $bmp = New-Object System.Drawing.Bitmap($s,$s)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(79,70,229))
  $g.FillEllipse([System.Drawing.Brushes]::White, $s*0.25, $s*0.25, $s*0.5, $s*0.5)
  $font = New-Object System.Drawing.Font('Arial', ($s/3))
  $g.DrawString('S', $font, [System.Drawing.Brushes]::White, $s*0.32, $s*0.25)
  $g.Dispose()
  $bmp.Save((Join-Path "client/public" ("icon-$s.png")), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
