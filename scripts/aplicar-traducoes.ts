#!/usr/bin/env bun
/**
 * Script para aplicar traduções nos arquivos do código
 * 
 * Uso:
 *   bun run scripts/aplicar-traducoes.ts [--dry-run] [--prioridade=maxima|alta|media|baixa]
 * 
 * Opções:
 *   --dry-run: Apenas mostra o que seria traduzido sem modificar arquivos
 *   --prioridade: Filtra por prioridade (padrão: todas)
 *   --categoria: Filtra por número de categoria específica
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

interface StringTraduzida {
  original: string
  traducao: string
  arquivo: string
  linha: string
  categoria: string
  prioridade: string
  jaTradzido?: boolean
}

interface Traducoes {
  metadata: {
    geradoEm: string
    totalCategorias: number
    totalStrings: number
    versao: string
  }
  categorias: Record<string, {
    prioridade: string
    total: number
    jaTradzidas: number
    strings: StringTraduzida[]
  }>
}

// Parse argumentos
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const prioridadeArg = args.find(arg => arg.startsWith('--prioridade='))?.split('=')[1]
const categoriaArg = args.find(arg => arg.startsWith('--categoria='))?.split('=')[1]

/**
 * Carrega o arquivo de traduções geradas
 */
async function carregarTraducoes(): Promise<Traducoes> {
  const traducoesPath = join(process.cwd(), 'traducoes-geradas.json')
  const conteudo = await readFile(traducoesPath, 'utf-8')
  return JSON.parse(conteudo)
}

/**
 * Filtra strings por prioridade e categoria
 */
function filtrarStrings(traducoes: Traducoes): StringTraduzida[] {
  let strings: StringTraduzida[] = []
  
  for (const [nomeCategoria, categoria] of Object.entries(traducoes.categorias)) {
    // Filtrar por categoria se especificado
    if (categoriaArg) {
      const numeroCategoria = nomeCategoria.split('.')[0]
      if (numeroCategoria !== categoriaArg) {
        continue
      }
    }
    
    // Filtrar por prioridade se especificado
    if (prioridadeArg && categoria.prioridade !== prioridadeArg) {
      continue
    }
    
    // Adicionar strings que não foram traduzidas ainda
    strings.push(...categoria.strings.filter(s => !s.jaTradzido && s.traducao !== s.original))
  }
  
  return strings
}

/**
 * Agrupa strings por arquivo
 */
function agruparPorArquivo(strings: StringTraduzida[]): Map<string, StringTraduzida[]> {
  const porArquivo = new Map<string, StringTraduzida[]>()
  
  for (const str of strings) {
    if (!porArquivo.has(str.arquivo)) {
      porArquivo.set(str.arquivo, [])
    }
    porArquivo.get(str.arquivo)!.push(str)
  }
  
  return porArquivo
}

/**
 * Aplica traduções em um arquivo
 */
async function aplicarTraducoesNoArquivo(
  arquivo: string,
  strings: StringTraduzida[],
  dryRun: boolean
): Promise<{ sucesso: number; falhas: number }> {
  const arquivoPath = join(process.cwd(), arquivo)
  
  try {
    let conteudo = await readFile(arquivoPath, 'utf-8')
    const linhas = conteudo.split('\n')
    
    let sucesso = 0
    let falhas = 0
    
    // Ordenar por linha (do maior para o menor para não afetar números de linha)
    const stringsOrdenadas = [...strings].sort((a, b) => parseInt(b.linha) - parseInt(a.linha))
    
    for (const str of stringsOrdenadas) {
      const numLinha = parseInt(str.linha) - 1 // Arrays são 0-indexed
      
      if (numLinha < 0 || numLinha >= linhas.length) {
        console.warn(`⚠️  Linha ${str.linha} fora do range em ${arquivo}`)
        falhas++
        continue
      }
      
      const linhaOriginal = linhas[numLinha]
      
      // Verificar se a string original está na linha
      if (!linhaOriginal.includes(str.original)) {
        console.warn(`⚠️  String não encontrada na linha ${str.linha} de ${arquivo}`)
        console.warn(`   Esperado: "${str.original}"`)
        console.warn(`   Linha: ${linhaOriginal.trim()}`)
        falhas++
        continue
      }
      
      // Substituir a string
      const linhaModificada = linhaOriginal.replace(str.original, str.traducao)
      
      if (dryRun) {
        console.log(`\n📝 ${arquivo}:${str.linha}`)
        console.log(`   - Original: "${str.original}"`)
        console.log(`   + Tradução: "${str.traducao}"`)
      } else {
        linhas[numLinha] = linhaModificada
      }
      
      sucesso++
    }
    
    // Salvar arquivo modificado
    if (!dryRun && sucesso > 0) {
      const novoConteudo = linhas.join('\n')
      await writeFile(arquivoPath, novoConteudo, 'utf-8')
      console.log(`✅ ${arquivo}: ${sucesso} traduções aplicadas`)
    }
    
    return { sucesso, falhas }
  } catch (error) {
    console.error(`❌ Erro ao processar ${arquivo}:`, error)
    return { sucesso: 0, falhas: strings.length }
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('🌐 Aplicador de Traduções - Claudinho PT-BR\n')
    
    if (dryRun) {
      console.log('🔍 Modo DRY-RUN: Nenhum arquivo será modificado\n')
    }
    
    console.log('📂 Carregando traduções...')
    const traducoes = await carregarTraducoes()
    
    console.log(`✅ Carregadas ${traducoes.metadata.totalStrings} strings de ${traducoes.metadata.totalCategorias} categorias\n`)
    
    console.log('🔍 Filtrando strings...')
    const stringsFiltradas = filtrarStrings(traducoes)
    
    if (stringsFiltradas.length === 0) {
      console.log('ℹ️  Nenhuma string para traduzir com os filtros especificados')
      return
    }
    
    console.log(`📝 ${stringsFiltradas.length} strings para traduzir`)
    
    if (prioridadeArg) {
      console.log(`   Prioridade: ${prioridadeArg}`)
    }
    if (categoriaArg) {
      console.log(`   Categoria: ${categoriaArg}`)
    }
    
    console.log('\n📁 Agrupando por arquivo...')
    const porArquivo = agruparPorArquivo(stringsFiltradas)
    console.log(`   ${porArquivo.size} arquivos serão modificados\n`)
    
    console.log('🚀 Aplicando traduções...\n')
    
    let totalSucesso = 0
    let totalFalhas = 0
    
    for (const [arquivo, strings] of porArquivo) {
      const { sucesso, falhas } = await aplicarTraducoesNoArquivo(arquivo, strings, dryRun)
      totalSucesso += sucesso
      totalFalhas += falhas
    }
    
    console.log('\n📊 Resumo:')
    console.log(`   ✅ Sucesso: ${totalSucesso}`)
    console.log(`   ❌ Falhas: ${totalFalhas}`)
    console.log(`   📁 Arquivos: ${porArquivo.size}`)
    
    if (dryRun) {
      console.log('\n💡 Execute sem --dry-run para aplicar as traduções')
    } else {
      console.log('\n✨ Traduções aplicadas com sucesso!')
      console.log('⚠️  Lembre-se de testar a compilação: bun run build')
    }
  } catch (error) {
    console.error('❌ Erro ao aplicar traduções:', error)
    process.exit(1)
  }
}

// Executar
main()
