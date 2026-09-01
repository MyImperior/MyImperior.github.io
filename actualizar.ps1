# ============================================================
#  actualizar.ps1
#  Lee LIBRARY.xlsx (dos hojas) y genera dos JSON:
#      SCIENCE-FICTION  ->  datos/ciencia-ficcion.json
#      SCIENCE          ->  datos/ciencia.json
#  Despues los publica en GitHub Pages.
#
#  Uso:  .\actualizar.ps1
#  Colocar en la RAIZ del repositorio MyImperior.github.io
#
#  Columnas (fila 1 de cada hoja):
#    SCIENCE-FICTION:
#      AUTOR | TITULO | FECHA | NARRADOR | LEIDO |
#      CLASICOS | MIO | IDIOMA | DATOS | COLOR
#    SCIENCE:
#      AUTOR | TITULO | FECHA | COLECCION | LEIDO | DATOS | COLOR
#
#  DATOS se ignora a proposito en ambas hojas: es una columna
#  de uso personal que no viaja a la web.
#
#  LEIDO admite tres estados:
#      "SI"   -> leido
#      "L"    -> leyendo ahora mismo
#      vacio  -> pendiente
# ============================================================

$ErrorActionPreference = "Stop"

# ---------- CONFIGURACION ----------
$archivoExcel = "LIBRARY.xlsx"

# Una entrada por hoja. Anadir una hoja nueva en el futuro es
# anadir una linea aqui, nada mas.
$hojas = @(
    @{ nombre = "SCIENCE-FICTION"; destino = "datos\ciencia-ficcion.json"; tipo = "ficcion" },
    @{ nombre = "SCIENCE";         destino = "datos\ciencia.json";         tipo = "ciencia" }
)
# -----------------------------------


# --- 1. Comprobar que existe el modulo ImportExcel ---
if (-not (Get-Module -ListAvailable -Name ImportExcel)) {
    Write-Host ""
    Write-Host "FALTA EL MODULO ImportExcel." -ForegroundColor Red
    Write-Host "Instalalo UNA SOLA VEZ con:" -ForegroundColor Yellow
    Write-Host "    Install-Module ImportExcel -Scope CurrentUser" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
Import-Module ImportExcel


# --- 2. Comprobar que existe el Excel ---
if (-not (Test-Path $archivoExcel)) {
    Write-Host "No encuentro $archivoExcel en esta carpeta." -ForegroundColor Red
    Write-Host "Ejecuta el script desde la raiz del repositorio." -ForegroundColor Yellow
    exit 1
}


# --- 3. Funcion de limpieza ---
# Quita espacios sobrantes y convierte celdas vacias en $null.
function Limpiar($texto) {
    if ($null -eq $texto) { return $null }
    $t = ([string]$texto).Trim()
    if ($t -eq "") { return $null }
    return $t
}


# Acumulador para el commit final: rutas de los JSON generados.
$generados = New-Object System.Collections.ArrayList
$totalGlobal = 0


# ============================================================
#  BUCLE PRINCIPAL: una pasada por hoja
# ============================================================
foreach ($hoja in $hojas) {

    Write-Host ""
    Write-Host "=== HOJA: $($hoja.nombre) ===" -ForegroundColor Cyan

    # --- 4. Leer la hoja ---
    # Ahora SI indicamos el nombre. Con varias hojas en el libro,
    # Import-Excel sin -WorksheetName coge la primera EN SILENCIO,
    # que es exactamente el fallo que no queremos.
    $filas = Import-Excel -Path $archivoExcel -WorksheetName $hoja.nombre

    # --- 5. Recorrer las filas y construir la lista ---
    $libros    = New-Object System.Collections.ArrayList
    $id        = 1
    $descartes = 0
    $avisos    = New-Object System.Collections.ArrayList

    foreach ($f in $filas) {

        $autor  = Limpiar $f.AUTOR
        $titulo = Limpiar $f.TITULO

        # Fila completamente vacia (las que Excel arrastra al final).
        if ($null -eq $autor -and $null -eq $titulo) { $descartes++; continue }

        # Red de seguridad permanente: sin titulo no hay libro.
        if ($null -eq $titulo) {
            [void]$avisos.Add("DESCARTADO por no tener titulo: $autor")
            continue
        }
        if ($null -eq $autor) {
            [void]$avisos.Add("Sin autor: $titulo")
        }

        # FECHA debe ser numero para poder ordenar cronologicamente.
        $fecha = $null
        $fechaBruta = Limpiar $f.FECHA
        if ($null -ne $fechaBruta) {
            $n = 0
            if ([int]::TryParse($fechaBruta, [ref]$n)) { $fecha = $n }
            else { [void]$avisos.Add("Fecha no numerica en '$titulo': $fechaBruta") }
        } else {
            [void]$avisos.Add("Sin fecha: $titulo")
        }

        # --- LEIDO: tres estados en una sola columna ---
        # Se convierte en DOS booleanos independientes porque en JS
        # comparar cadenas ("SI", "L") invita a errores de mayusculas
        # y de acentos. Con booleanos, if (libro.leido) es inequivoco.
        # Un valor distinto de SI / L se avisa y NO se interpreta:
        # asi una errata no se cuela como "pendiente" en silencio.
        $leido   = $false
        $leyendo = $false
        $marca   = Limpiar $f.LEIDO
        if ($null -ne $marca) {
            switch ($marca.ToUpper()) {
                "SI" { $leido   = $true }
                "L"  { $leyendo = $true }
                default {
                    [void]$avisos.Add("LEIDO no reconocido en '$titulo': '$marca' (se espera SI, L o vacio)")
                }
            }
        }

        # El codigo de color se normaliza a mayusculas: si no,
        # una 'r' y una 'R' serian dos colores distintos para el JS.
        $color = Limpiar $f.COLOR
        if ($color) { $color = $color.ToUpper() }

        # --- Campos comunes a las dos hojas ---
        $libro = [ordered]@{
            id      = $id
            titulo  = $titulo
            autor   = $autor
            fecha   = $fecha
            leido   = $leido
            leyendo = $leyendo
        }

        # --- Campos propios de cada hoja ---
        if ($hoja.tipo -eq "ficcion") {

            # Idioma y narrador se normalizan para que los filtros no
            # dupliquen valores por diferencias de mayusculas.
            $idioma = Limpiar $f.IDIOMA
            if ($idioma) { $idioma = $idioma.ToUpper() }

            $narrador = Limpiar $f.NARRADOR
            if ($narrador) { $narrador = $narrador.ToLower() }

            # Marcas de presencia: cualquier contenido cuenta como si.
            $libro.narrador = $narrador
            $libro.idioma   = $idioma
            $libro.clasico  = ($null -ne (Limpiar $f.CLASICOS))
            $libro.mio      = ($null -ne (Limpiar $f.MIO))

        } else {

            $libro.coleccion = Limpiar $f.COLECCION
        }

        # El color va al final para que se lea comodo en el JSON.
        $libro.color = $color

        [void]$libros.Add($libro)
        $id++
    }


    # --- 6. Escribir el JSON de esta hoja ---
    $carpeta = Split-Path $hoja.destino -Parent
    if ($carpeta -and -not (Test-Path $carpeta)) {
        New-Item -ItemType Directory -Path $carpeta | Out-Null
    }

    # -Depth 5 porque por defecto PowerShell solo baja 2 niveles y
    # convertiria los objetos en la cadena literal "System.Object[]"
    $json = $libros | ConvertTo-Json -Depth 5

    # Con 0 o 1 elementos ConvertTo-Json no devuelve una lista.
    # Lo forzamos a lista para que el JS no falle.
    if ($libros.Count -eq 0) { $json = "[]" }
    elseif ($libros.Count -eq 1) { $json = "[" + $json + "]" }

    # UTF-8 SIN BOM. Windows PowerShell 5.1 escribe UTF-8 CON BOM por
    # defecto: 3 bytes invisibles al principio que hacen fallar
    # JSON.parse() en el navegador con un error incomprensible.
    $sinBOM  = New-Object System.Text.UTF8Encoding($false)
    $rutaAbs = Join-Path (Get-Location) $hoja.destino
    [System.IO.File]::WriteAllText($rutaAbs, $json, $sinBOM)

    [void]$generados.Add($hoja.destino)
    $totalGlobal += $libros.Count


    # --- 7. Informe de esta hoja ---
    Write-Host "Libros convertidos: $($libros.Count)  ->  $($hoja.destino)" -ForegroundColor Green
    if ($descartes -gt 0) {
        Write-Host "Filas vacias ignoradas: $descartes" -ForegroundColor DarkGray
    }

    if ($avisos.Count -gt 0) {
        Write-Host ""
        Write-Host "AVISOS ($($avisos.Count)):" -ForegroundColor Yellow
        foreach ($a in $avisos) { Write-Host "  - $a" -ForegroundColor Yellow }
        Write-Host "Revisalos: el JSON se ha generado igualmente." -ForegroundColor DarkGray
    }

    # Resumen de valores unicos: aqui se ve al instante si se ha
    # colado un "Esp" junto a un "ESP", que serian dos filtros distintos.
    #
    # OJO con el @( ) que envuelve cada conteo: Where-Object devuelve
    # el objeto pelado cuando solo hay UN resultado, y pedirle .Count a
    # un hashtable devuelve su numero de claves, no 1. Sin el @( ) los
    # contadores dan numeros verosimiles pero falsos.
    Write-Host ""
    $colores = @($libros | ForEach-Object { $_.color } | Where-Object { $_ } | Sort-Object -Unique)
    Write-Host "Colores:    $($colores -join ', ')"
    Write-Host "Sin color:  $(@($libros | Where-Object { -not $_.color }).Count)"
    Write-Host "Leidos:     $(@($libros | Where-Object { $_.leido }).Count)"
    Write-Host "Leyendo:    $(@($libros | Where-Object { $_.leyendo }).Count)"
    Write-Host "Pendientes: $(@($libros | Where-Object { -not $_.leido -and -not $_.leyendo }).Count)"

    if ($hoja.tipo -eq "ficcion") {
        $idiomas    = @($libros | ForEach-Object { $_.idioma }   | Where-Object { $_ } | Sort-Object -Unique)
        $narradores = @($libros | ForEach-Object { $_.narrador } | Where-Object { $_ } | Sort-Object -Unique)
        Write-Host "Idiomas:    $($idiomas -join ', ')"
        Write-Host "Narradores: $($narradores -join ', ')"
        Write-Host "Clasicos:   $(@($libros | Where-Object { $_.clasico }).Count)"
        Write-Host "Mios:       $(@($libros | Where-Object { $_.mio }).Count)"
    } else {
        $colecciones = @($libros | ForEach-Object { $_.coleccion } | Where-Object { $_ } | Sort-Object -Unique)
        Write-Host "Colecciones ($(@($colecciones).Count)):"
        foreach ($c in $colecciones) { Write-Host "    $c" -ForegroundColor DarkGray }
    }
}


# ============================================================
#  8. Publicar en GitHub
# ============================================================
Write-Host ""
Write-Host "TOTAL: $totalGlobal libros en $($generados.Count) archivos." -ForegroundColor Green
Write-Host ""
$respuesta = Read-Host "Publicar en GitHub? (s/n)"

if ($respuesta -eq "s") {
    # $sello es el marcador de tiempo del commit. Se llama asi
    # (y no $fecha) para no chocar con la variable $fecha del bucle.
    $sello = Get-Date -Format "yyyy-MM-dd HH:mm"
    git add $generados $archivoExcel
    git commit -m "Biblioteca actualizada: $totalGlobal libros ($sello)"
    git push
    Write-Host ""
    Write-Host "Publicado. Tarda 1-2 minutos en verse en la web." -ForegroundColor Green
} else {
    Write-Host "JSON generados pero NO publicados." -ForegroundColor DarkGray
}
