# Ejecuta este script cada vez que agregues fotos nuevas a cualquier carpeta
# Click derecho > "Ejecutar con PowerShell"

$baseDir = "$PSScriptRoot\images"
$extensions = @("*.jpg","*.jpeg","*.png","*.webp")

Get-ChildItem -Path $baseDir -Directory | ForEach-Object {
    $folder = $_.FullName
    $files = @()
    foreach ($ext in $extensions) {
        Get-ChildItem -Path $folder -Filter $ext | Sort-Object Name | ForEach-Object {
            $files += $_.Name
        }
    }
    # Ordenar: si existe foto1.* va primero, luego el resto alfabetico
    $portada = $files | Where-Object { $_ -match '^foto1\.' }
    $resto   = $files | Where-Object { $_ -notmatch '^foto1\.' }
    $files   = @($portada) + @($resto) | Where-Object { $_ }

    if ($files.Count -eq 0) {
        '[]' | Set-Content -Path "$folder\index.json" -Encoding UTF8
        Write-Host "  $($_.Name): sin fotos"
    } elseif ($files.Count -eq 1) {
        ('["' + $files[0] + '"]') | Set-Content -Path "$folder\index.json" -Encoding UTF8
        Write-Host "OK $($_.Name): 1 foto  ->  portada: $($files[0])"
    } else {
        ($files | ConvertTo-Json -Compress) | Set-Content -Path "$folder\index.json" -Encoding UTF8
        Write-Host "OK $($_.Name): $($files.Count) fotos  ->  portada: $($files[0])"
    }
}

Write-Host ""
Write-Host "Listo! Recarga el navegador para ver los cambios." -ForegroundColor Green
Read-Host "Presiona Enter para cerrar"
