param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [string]$OutputPath = "services/product-service/src/main/resources/real-products.tsv",

    [string]$InventoryOutputPath = "services/inventory-service/src/main/resources/real-products.tsv",

    [ValidateRange(1, 1000)]
    [int]$Limit = 200
)

$ErrorActionPreference = "Stop"

function Get-Number([string]$Value) {
    if ([string]::IsNullOrWhiteSpace($Value)) { return 0 }
    $clean = $Value -replace '[^0-9.]', ''
    if ([string]::IsNullOrWhiteSpace($clean)) { return 0 }
    return [decimal]::Parse($clean, [Globalization.CultureInfo]::InvariantCulture)
}

function Clean-Text([string]$Value, [int]$MaximumLength) {
    $clean = ($Value -replace '[\t\r\n]+', ' ' -replace '\s{2,}', ' ').Trim()
    if ($clean.Length -le $MaximumLength) { return $clean }
    $cut = $clean.Substring(0, $MaximumLength - 1)
    $lastSpace = $cut.LastIndexOf(' ')
    if ($lastSpace -gt 40) { $cut = $cut.Substring(0, $lastSpace) }
    return "$cut…"
}

function Get-StableProductImage([string]$Value) {
    if ([string]::IsNullOrWhiteSpace($Value)) { return $Value }

    # Amazon's dataset often contains short-lived thumbnail transforms such as
    # /W/WEBP_402378-T1/ and _SX300_..._FMwebp_. The underlying image id is
    # stable, so store a regular 600px JPEG URL that browsers can load directly.
    $match = [regex]::Match($Value, '(?i)/images/I/([^.?/]+)')
    if ($match.Success -and $Value -match '(?i)(media-amazon\.com|ssl-images-amazon\.com)') {
        return "https://m.media-amazon.com/images/I/$($match.Groups[1].Value)._SL600_.jpg"
    }

    return $Value.Trim()
}

function Get-Brand([string]$Title) {
    $knownBrands = @(
        'Amazon Basics', 'AmazonBasics', 'Fire-Boltt', 'Western Digital', 'Eureka Forbes',
        'TP-Link', 'SanDisk', 'OnePlus', 'Samsung', 'Redmi', 'Xiaomi', 'realme', 'iQOO',
        'Motorola', 'Nokia', 'Oppo', 'Vivo', 'Apple', 'Sony', 'JBL', 'boAt', 'Noise',
        'Fastrack', 'Amazfit', 'Logitech', 'Zebronics', 'Portronics', 'Ambrane', 'Belkin',
        'Seagate', 'Kingston', 'HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'Canon', 'Epson',
        'Philips', 'Havells', 'Bajaj', 'Prestige', 'Pigeon', 'Butterfly', 'Crompton',
        'Usha', 'Orient', 'KENT', 'AGARO', 'INALSA', 'Lifelong', 'Bosch', 'Milton',
        'Wipro', 'Godrej', 'LG', 'Panasonic', 'Whirlpool', 'Haier', 'Voltas', 'Daikin'
    )
    foreach ($brand in $knownBrands) {
        if ($Title -match "(?i)(^|\s)$([regex]::Escape($brand))(\s|$)") {
            if ($brand -eq 'AmazonBasics') { return 'Amazon Basics' }
            return $brand
        }
    }
    $candidate = (($Title -split '\s+')[0] -replace '[^\p{L}\p{N}&+.-]', '').Trim()
    if ([string]::IsNullOrWhiteSpace($candidate)) { return 'Marketplace Brand' }
    return $candidate
}

function Get-NovaCategory([string]$Leaf) {
    if ($Leaf -match '(?i)In-Ear|On-Ear|Over-Ear|Speaker|Headset|Microphone|Earphone') { return 'audio' }
    if ($Leaf -match '(?i)Charger|PowerBank|Sleeve|Case|Stand|MousePad|Stylus') { return 'accessories' }
    if ($Leaf -match '(?i)Toy|Game') { return 'toys' }
    if ($Leaf -match '(?i)Mixer|Kettle|Fryer|Cook|Iron|Blender|Vacuum|Purifier|Heater|Fan|Coffee|Grinder|Boiler|Toaster') { return 'appliances' }
    if ($Leaf -match '(?i)Basket|Lamp|Décor|Scale') { return 'home' }
    return 'technology'
}

$quota = [ordered]@{
    Smartphones = 20; SmartTelevisions = 14; SmartWatches = 12; 'In-Ear' = 12; 'On-Ear' = 8
    BluetoothSpeakers = 6; Mice = 5; GamingMice = 4; 'Keyboard&MouseSets' = 5; Keyboards = 5
    Routers = 5; GraphicTablets = 5; PenDrives = 5; ExternalHardDisks = 5; MicroSD = 5
    PowerBanks = 5; WallChargers = 5; Projectors = 3; Printers = 3; Gamepads = 3; DomeCameras = 3
    MixerGrinders = 8; ElectricKettles = 7; AirFryers = 5; InductionCooktop = 5; DryIrons = 6
    SteamIrons = 5; HandBlenders = 5; JuicerMixerGrinders = 5; HandheldVacuums = 5
    'WaterFilters&Purifiers' = 5; CeilingFans = 5; DripCoffeeMachines = 5; 'Toys&Games' = 1
}

$rows = Import-Csv -LiteralPath $InputPath -Encoding UTF8
$normalised = foreach ($row in $rows) {
    $price = Get-Number $row.discounted_price
    $original = Get-Number $row.actual_price
    $rating = Get-Number $row.rating
    $reviewCount = [long](Get-Number $row.rating_count)
    $leaf = (($row.category -split '\|')[-1]).Trim()
    if ($row.product_id -and $row.product_name -and $row.img_link -and $price -gt 0 -and $original -gt 0 -and $rating -ge 1 -and $leaf) {
        $title = Clean-Text $row.product_name 150
        if (($title -replace '[^\p{L}\p{N}]', '').Length -lt 8) { continue }
        $brand = Get-Brand $row.product_name
        $description = Clean-Text (($row.about_product -replace '\|', ' ')) 520
        if ($description.Length -lt 30 -or $description -notmatch '[\p{L}\p{N}]{5}') {
            $description = "Authentic marketplace listing for $title by $brand."
        }
        [pscustomobject]@{
            ProductId = $row.product_id.Trim()
            Title = $title
            Brand = $brand
            Leaf = $leaf
            Category = Get-NovaCategory $leaf
            Price = [long][math]::Round($price)
            Original = [long][math]::Round($original)
            Description = $description
            Image = Get-StableProductImage $row.img_link
            Rating = [double]$rating
            ReviewCount = $reviewCount
        }
    }
}

$normalised = $normalised |
    Group-Object ProductId |
    ForEach-Object { $_.Group | Sort-Object ReviewCount -Descending | Select-Object -First 1 }

$selected = [Collections.Generic.List[object]]::new()
$selectedIds = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)

foreach ($entry in $quota.GetEnumerator()) {
    $normalised |
        Where-Object Leaf -eq $entry.Key |
        Sort-Object ReviewCount, Rating -Descending |
        Select-Object -First $entry.Value |
        ForEach-Object {
            if ($selectedIds.Add($_.ProductId)) { $selected.Add($_) }
        }
}

$blockedLeaves = 'USBCables|HDMICables|RemoteControls|ScreenProtectors|Earpads|Cable'
$normalised |
    Where-Object { $_.Leaf -notmatch $blockedLeaves -and -not $selectedIds.Contains($_.ProductId) } |
    Sort-Object ReviewCount, Rating -Descending |
    ForEach-Object {
        if ($selected.Count -lt $Limit -and $selectedIds.Add($_.ProductId)) { $selected.Add($_) }
    }

if ($selected.Count -lt $Limit) {
    throw "Only $($selected.Count) valid products were available; $Limit were requested."
}

$output = [Collections.Generic.List[string]]::new()
$output.Add("slug`tTitle`tbrand`tcategory`tprice`toriginal`tdescription`timage`trating`treviewCount")
foreach ($product in ($selected | Select-Object -First $Limit)) {
    $slug = "india-$($product.ProductId.ToLowerInvariant())"
    $line = @(
        $slug, $product.Title, $product.Brand, $product.Category, $product.Price,
        $product.Original, $product.Description, $product.Image,
        $product.Rating.ToString('0.0', [Globalization.CultureInfo]::InvariantCulture),
        $product.ReviewCount
    ) -join "`t"
    $output.Add($line)
}

$resolvedOutput = Join-Path (Get-Location) $OutputPath
[IO.File]::WriteAllLines($resolvedOutput, $output, [Text.UTF8Encoding]::new($false))
$resolvedInventoryOutput = Join-Path (Get-Location) $InventoryOutputPath
[IO.File]::WriteAllLines($resolvedInventoryOutput, $output, [Text.UTF8Encoding]::new($false))
Write-Output "Wrote $Limit authentic catalogue records to Product and Inventory service resources"
