# Script para traduzir descricoes de skills em massa

$ErrorActionPreference = "Continue"

function Translate-Description {
    param([string]$text)
    
    $text = $text -replace '^Expert in ', 'Expert em '
    $text = $text -replace '^Expert ', 'Expert em '
    $text = $text -replace '^Specialist in ', 'Especialista em '
    $text = $text -replace ' Use for ', ' Use pra '
    $text = $text -replace ' Use when ', ' Use quando '
    $text = $text -replace ' Triggers on ', ' Ativa com: '
    $text = $text -replace ' and ', ' e '
    $text = $text -replace ' or ', ' ou '
    $text = $text -replace ' with ', ' com '
    $text = $text -replace ' best practices', ' melhores praticas'
    $text = $text -replace ' decision-making', ' tomada de decisao'
    $text = $text -replace ' principles', ' principios'
    $text = $text -replace ' guidelines', ' diretrizes'
    $text = $text -replace ' automation', ' automacao'
    $text = $text -replace ' testing', ' testes'
    $text = $text -replace ' development', ' desenvolvimento'
    $text = $text -replace ' optimization', ' otimizacao'
    $text = $text -replace ' security', ' seguranca'
    $text = $text -replace ' integration', ' integracao'
    $text = $text -replace ' implementation', ' implementacao'
    $text = $text -replace ' configuration', ' configuracao'
    $text = $text -replace ' management', ' gerenciamento'
    $text = $text -replace ' migration', ' migracao'
    $text = $text -replace ' monitoring', ' monitoramento'
    $text = $text -replace ' analysis', ' analise'
    $text = $text -replace ' refactoring', ' refatoracao'
    $text = $text -replace ' documentation', ' documentacao'
    
    return $text
}

Write-Host "=== TRADUCAO EM MASSA DE SKILLS ===" -ForegroundColor Green
Write-Host ""

$allSkills = Get-ChildItem -Path "C:\Users\Bruno\.claude\skills" -Filter "SKILL.md" -Recurse
$total = $allSkills.Count
$current = 0
$translated = 0
$skipped = 0
$errors = 0

foreach ($skillFile in $allSkills) {
    $current++
    $percent = [math]::Round(($current / $total) * 100, 1)
    Write-Progress -Activity "Traduzindo skills" -Status "$current de $total ($percent%)" -PercentComplete $percent
    
    try {
        $content = Get-Content $skillFile.FullName -Raw -ErrorAction Stop
        
        if ($content -match 'description:\s*([^\n]+)') {
            $desc = $matches[1].Trim()
            
            if ($desc -notmatch '^[A-Za-z]' -or $desc -match 'pra |Expert em |Especialista em ') {
                $skipped++
                continue
            }
            
            $newDesc = Translate-Description $desc
            $newContent = $content -replace [regex]::Escape("description: $desc"), "description: $newDesc"
            $newContent | Set-Content $skillFile.FullName -NoNewline -ErrorAction Stop
            
            $translated++
            
            if ($translated % 50 -eq 0) {
                Write-Host "  OK $translated skills traduzidas..." -ForegroundColor Cyan
            }
        } else {
            $skipped++
        }
    } catch {
        $errors++
        Write-Host "  ERRO em $($skillFile.Name): $_" -ForegroundColor Red
    }
}

Write-Progress -Activity "Traduzindo skills" -Completed

Write-Host ""
Write-Host "=== RESULTADO ===" -ForegroundColor Green
Write-Host "Total de skills: $total" -ForegroundColor White
Write-Host "Traduzidas: $translated" -ForegroundColor Green
Write-Host "Puladas: $skipped" -ForegroundColor Yellow
Write-Host "Erros: $errors" -ForegroundColor Red
Write-Host ""
Write-Host "Concluido!" -ForegroundColor Green
