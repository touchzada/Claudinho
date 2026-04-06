#!/usr/bin/env bun
/**
 * Script para gerar traduções automáticas das strings catalogadas no inventário
 * 
 * Uso:
 *   bun run scripts/gerar-traducoes.ts
 * 
 * Saída:
 *   traducoes-geradas.json - Arquivo com todas as traduções
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

interface StringParaTraduzir {
  original: string
  arquivo: string
  linha: string
  categoria: string
  prioridade: 'maxima' | 'alta' | 'media' | 'baixa'
  contexto?: string
  traducao?: string
  jaTradzido?: boolean
}

interface Categoria {
  nome: string
  prioridade: 'maxima' | 'alta' | 'media' | 'baixa'
  strings: StringParaTraduzir[]
}

// Regex para extrair strings do inventário
const STRING_PATTERN = /`([^`]+):(\d+)` - "([^"]+)"(?: ✅ JÁ TRADUZIDO)?/g
const STRING_PATTERN_ALT = /`([^`]+):(\d+)` - '([^']+)'(?: ✅ JÁ TRADUZIDO)?/g
const CATEGORIA_PATTERN = /^### (\d+)\. ([A-Z\s\-\/]+) \(Prioridade (Máxima|Alta|Média|Baixa)\)/gm

/**
 * Extrai todas as strings do inventário
 */
async function extrairStringsDoInventario(): Promise<Categoria[]> {
  const inventarioPath = join(process.cwd(), 'INVENTARIO_STRINGS_TRADUCAO.md')
  const conteudo = await readFile(inventarioPath, 'utf-8')
  
  const categorias: Categoria[] = []
  let categoriaAtual: Categoria | null = null
  
  const linhas = conteudo.split('\n')
  
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i]
    
    // Detectar nova categoria
    const matchCategoria = linha.match(/^### (\d+)\. ([A-Z\s\-\/]+) \(Prioridade (Máxima|Alta|Média|Baixa)\)/)
    if (matchCategoria) {
      const [, numero, nome, prioridade] = matchCategoria
      categoriaAtual = {
        nome: `${numero}. ${nome}`,
        prioridade: prioridade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') as any,
        strings: []
      }
      categorias.push(categoriaAtual)
      continue
    }
    
    // Extrair strings da categoria atual
    if (categoriaAtual && linha.includes('`') && linha.includes(':')) {
      // Tentar extrair com aspas duplas
      let match = linha.match(/`([^`]+):(\d+)` - "([^"]+)"(?: ✅)?/)
      if (!match) {
        // Tentar com aspas simples
        match = linha.match(/`([^`]+):(\d+)` - '([^']+)'(?: ✅)?/)
      }
      if (!match) {
        // Tentar sem aspas (para casos especiais)
        match = linha.match(/`([^`]+):(\d+)` - ([^\n]+?)(?: ✅)?$/)
      }
      
      if (match) {
        const [, arquivo, linhaNum, stringOriginal, jaTradzido] = match
        
        // Limpar a string
        let stringLimpa = stringOriginal.trim()
        
        // Remover marcadores de já traduzido
        stringLimpa = stringLimpa.replace(/✅.*$/, '').trim()
        
        // Pular se for muito curta ou for código
        if (stringLimpa.length < 3 || stringLimpa.startsWith('src/') || stringLimpa.includes('${')) {
          continue
        }
        
        // Verificar se já foi traduzido
        const foiTraduzido = linha.includes('✅') || linha.includes('JÁ TRADUZIDO')
        
        categoriaAtual.strings.push({
          original: stringLimpa,
          arquivo: arquivo,
          linha: linhaNum,
          categoria: categoriaAtual.nome,
          prioridade: categoriaAtual.prioridade,
          jaTradzido: foiTraduzido
        })
      }
    }
  }
  
  return categorias
}

/**
 * Traduz uma string para português brasileiro
 * Usa regras contextuais baseadas no tipo de string
 */
function traduzirString(str: StringParaTraduzir): string {
  const { original, categoria } = str
  
  // Se já foi traduzido, retornar original
  if (str.jaTradzido) {
    return original
  }
  
  // Dicionário de traduções comuns
  const traducoes: Record<string, string> = {
    // Ações
    'Cancel': 'Cancelar',
    'Continue': 'Continuar',
    'Close': 'Fechar',
    'Save': 'Salvar',
    'Delete': 'Deletar',
    'Remove': 'Remover',
    'Add': 'Adicionar',
    'Edit': 'Editar',
    'Create': 'Criar',
    'Update': 'Atualizar',
    'Install': 'Instalar',
    'Uninstall': 'Desinstalar',
    'Enable': 'Ativar',
    'Disable': 'Desativar',
    'Select': 'Selecionar',
    'Choose': 'Escolher',
    'Confirm': 'Confirmar',
    'Retry': 'Tentar novamente',
    'Skip': 'Pular',
    'Back': 'Voltar',
    'Next': 'Próximo',
    'Finish': 'Finalizar',
    'Submit': 'Enviar',
    'Apply': 'Aplicar',
    
    // Estados
    'Loading': 'Carregando',
    'Downloading': 'Baixando',
    'Uploading': 'Enviando',
    'Installing': 'Instalando',
    'Updating': 'Atualizando',
    'Checking': 'Verificando',
    'Validating': 'Validando',
    'Processing': 'Processando',
    'Completed': 'Concluído',
    'Failed': 'Falhou',
    'Success': 'Sucesso',
    'Error': 'Erro',
    'Warning': 'Aviso',
    'Invalid': 'Inválido',
    'Required': 'Obrigatório',
    
    // Mensagens comuns
    'Successfully': 'Com sucesso',
    'Failed to': 'Falha ao',
    'Unable to': 'Não foi possível',
    'Are you sure': 'Tem certeza',
    'Do you want': 'Você quer',
    'Would you like': 'Você gostaria',
    'Please': 'Por favor',
    'Press': 'Pressione',
    'Click': 'Clique',
    'Enter': 'Digite',
    'Type': 'Digite',
    'No': 'Não',
    'Yes': 'Sim',
    'OK': 'OK',
    
    // Termos técnicos (manter alguns em inglês)
    'API': 'API',
    'URL': 'URL',
    'JSON': 'JSON',
    'SSH': 'SSH',
    'Git': 'Git',
    'GitHub': 'GitHub',
    'OAuth': 'OAuth',
    'token': 'token',
    'plugin': 'plugin',
    'MCP': 'MCP',
    'LSP': 'LSP',
  }
  
  // Aplicar traduções palavra por palavra
  let traduzido = original
  
  for (const [en, pt] of Object.entries(traducoes)) {
    // Substituir palavra completa (case-insensitive)
    const regex = new RegExp(`\\b${en}\\b`, 'gi')
    traduzido = traduzido.replace(regex, (match) => {
      // Preservar capitalização
      if (match[0] === match[0].toUpperCase()) {
        return pt.charAt(0).toUpperCase() + pt.slice(1)
      }
      return pt
    })
  }
  
  // Traduções específicas por padrão
  traduzido = traduzido
    // Mensagens de erro
    .replace(/Error:/g, 'Erro:')
    .replace(/Warning:/g, 'Aviso:')
    .replace(/Invalid (.+)/g, '$1 inválido(a)')
    .replace(/Failed to (.+)/g, 'Falha ao $1')
    .replace(/Unable to (.+)/g, 'Não foi possível $1')
    .replace(/Successfully (.+)/g, '$1 com sucesso')
    .replace(/Completed successfully/g, 'Concluído com sucesso')
    
    // Perguntas
    .replace(/Are you sure you want to (.+)\?/g, 'Tem certeza que quer $1?')
    .replace(/Do you want to (.+)\?/g, 'Você quer $1?')
    .replace(/Would you like to (.+)\?/g, 'Você gostaria de $1?')
    
    // Estados
    .replace(/Loading (.+)/g, 'Carregando $1')
    .replace(/Downloading (.+)/g, 'Baixando $1')
    .replace(/Installing (.+)/g, 'Instalando $1')
    .replace(/Checking (.+)/g, 'Verificando $1')
    .replace(/Updating (.+)/g, 'Atualizando $1')
    
    // Placeholders
    .replace(/Enter (.+)/g, 'Digite $1')
    .replace(/Type (.+)/g, 'Digite $1')
    .replace(/Select (.+)/g, 'Selecione $1')
    .replace(/Choose (.+)/g, 'Escolha $1')
    
    // Instruções
    .replace(/Press (.+) to (.+)/g, 'Pressione $1 para $2')
    .replace(/Click (.+) to (.+)/g, 'Clique em $1 para $2')
    
    // Termos comuns
    .replace(/\bfile\b/gi, 'arquivo')
    .replace(/\bfolder\b/gi, 'pasta')
    .replace(/\bdirectory\b/gi, 'diretório')
    .replace(/\bpath\b/gi, 'caminho')
    .replace(/\bsettings\b/gi, 'configurações')
    .replace(/\boptions\b/gi, 'opções')
    .replace(/\bpermission\b/gi, 'permissão')
    .replace(/\bcommand\b/gi, 'comando')
    .replace(/\bsession\b/gi, 'sessão')
    .replace(/\btask\b/gi, 'tarefa')
    .replace(/\bproject\b/gi, 'projeto')
    .replace(/\bworkspace\b/gi, 'workspace')
    .replace(/\brepository\b/gi, 'repositório')
    .replace(/\bbranch\b/gi, 'branch')
    .replace(/\bversion\b/gi, 'versão')
    .replace(/\bupdate\b/gi, 'atualização')
    .replace(/\binstall\b/gi, 'instalar')
    .replace(/\bremove\b/gi, 'remover')
    .replace(/\bdelete\b/gi, 'deletar')
    .replace(/\bcancel\b/gi, 'cancelar')
    .replace(/\bcontinue\b/gi, 'continuar')
    .replace(/\bclose\b/gi, 'fechar')
    .replace(/\bsave\b/gi, 'salvar')
    .replace(/\bopen\b/gi, 'abrir')
    .replace(/\bsearch\b/gi, 'buscar')
    .replace(/\bfilter\b/gi, 'filtrar')
    .replace(/\bsort\b/gi, 'ordenar')
    .replace(/\bview\b/gi, 'visualizar')
    .replace(/\bedit\b/gi, 'editar')
    .replace(/\bcreate\b/gi, 'criar')
    .replace(/\bnew\b/gi, 'novo')
    .replace(/\bold\b/gi, 'antigo')
    .replace(/\bcurrent\b/gi, 'atual')
    .replace(/\bprevious\b/gi, 'anterior')
    .replace(/\bnext\b/gi, 'próximo')
    .replace(/\bfirst\b/gi, 'primeiro')
    .replace(/\blast\b/gi, 'último')
    .replace(/\ball\b/gi, 'todos')
    .replace(/\bnone\b/gi, 'nenhum')
    .replace(/\bsome\b/gi, 'alguns')
    .replace(/\bmany\b/gi, 'muitos')
    .replace(/\bfew\b/gi, 'poucos')
    .replace(/\bmore\b/gi, 'mais')
    .replace(/\bless\b/gi, 'menos')
    .replace(/\bother\b/gi, 'outro')
    .replace(/\bdefault\b/gi, 'padrão')
    .replace(/\bcustom\b/gi, 'personalizado')
    .replace(/\bauto\b/gi, 'automático')
    .replace(/\bmanual\b/gi, 'manual')
    .replace(/\benabled\b/gi, 'ativado')
    .replace(/\bdisabled\b/gi, 'desativado')
    .replace(/\bactive\b/gi, 'ativo')
    .replace(/\binactive\b/gi, 'inativo')
    .replace(/\bavailable\b/gi, 'disponível')
    .replace(/\bunavailable\b/gi, 'indisponível')
    .replace(/\bready\b/gi, 'pronto')
    .replace(/\bbusy\b/gi, 'ocupado')
    .replace(/\bidle\b/gi, 'ocioso')
    .replace(/\brunning\b/gi, 'executando')
    .replace(/\bstopped\b/gi, 'parado')
    .replace(/\bpaused\b/gi, 'pausado')
    .replace(/\bpending\b/gi, 'pendente')
    .replace(/\bcompleted\b/gi, 'concluído')
    .replace(/\bfailed\b/gi, 'falhou')
    .replace(/\bsuccess\b/gi, 'sucesso')
    .replace(/\berror\b/gi, 'erro')
    .replace(/\bwarning\b/gi, 'aviso')
    .replace(/\binfo\b/gi, 'informação')
    .replace(/\bdebug\b/gi, 'debug')
    .replace(/\bhelp\b/gi, 'ajuda')
    .replace(/\babout\b/gi, 'sobre')
    .replace(/\bsettings\b/gi, 'configurações')
    .replace(/\bpreferences\b/gi, 'preferências')
    .replace(/\baccount\b/gi, 'conta')
    .replace(/\bprofile\b/gi, 'perfil')
    .replace(/\buser\b/gi, 'usuário')
    .replace(/\bteam\b/gi, 'equipe')
    .replace(/\borganization\b/gi, 'organização')
  
  // Se não mudou nada, tentar tradução mais agressiva
  if (traduzido === original) {
    // Adicionar contexto baseado na categoria
    if (categoria.includes('LOADING') || categoria.includes('PROGRESS')) {
      traduzido = traduzido.replace(/…$/, '…') // Manter reticências
    }
    
    if (categoria.includes('ERROR') || categoria.includes('INVALID')) {
      if (!traduzido.startsWith('Erro:') && !traduzido.startsWith('Aviso:')) {
        // Pode ser uma mensagem de erro sem prefixo
      }
    }
  }
  
  return traduzido
}

/**
 * Gera arquivo JSON com todas as traduções
 */
async function gerarArquivoTraducoes(categorias: Categoria[]): Promise<void> {
  const traducoes: Record<string, any> = {
    metadata: {
      geradoEm: new Date().toISOString(),
      totalCategorias: categorias.length,
      totalStrings: categorias.reduce((acc, cat) => acc + cat.strings.length, 0),
      versao: '1.0.0'
    },
    categorias: {}
  }
  
  for (const categoria of categorias) {
    const stringsComTraducao = categoria.strings.map(str => ({
      ...str,
      traducao: traduzirString(str)
    }))
    
    traducoes.categorias[categoria.nome] = {
      prioridade: categoria.prioridade,
      total: stringsComTraducao.length,
      jaTradzidas: stringsComTraducao.filter(s => s.jaTradzido).length,
      strings: stringsComTraducao
    }
  }
  
  const outputPath = join(process.cwd(), 'traducoes-geradas.json')
  await writeFile(outputPath, JSON.stringify(traducoes, null, 2), 'utf-8')
  
  console.log(`✅ Traduções geradas com sucesso!`)
  console.log(`📁 Arquivo: ${outputPath}`)
  console.log(`📊 Estatísticas:`)
  console.log(`   - Total de categorias: ${traducoes.metadata.totalCategorias}`)
  console.log(`   - Total de strings: ${traducoes.metadata.totalStrings}`)
  console.log(`   - Já traduzidas: ${Object.values(traducoes.categorias).reduce((acc: number, cat: any) => acc + cat.jaTradzidas, 0)}`)
  console.log(`   - Para traduzir: ${traducoes.metadata.totalStrings - Object.values(traducoes.categorias).reduce((acc: number, cat: any) => acc + cat.jaTradzidas, 0)}`)
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('🔍 Extraindo strings do inventário...')
    const categorias = await extrairStringsDoInventario()
    
    console.log(`✅ Encontradas ${categorias.length} categorias`)
    console.log(`📝 Total de strings: ${categorias.reduce((acc, cat) => acc + cat.strings.length, 0)}`)
    
    console.log('\n🌐 Gerando traduções...')
    await gerarArquivoTraducoes(categorias)
    
    console.log('\n✨ Processo concluído!')
  } catch (error) {
    console.error('❌ Erro ao gerar traduções:', error)
    process.exit(1)
  }
}

// Executar
main()
