// src/components/ImportacaoEscalas.tsx
import React, { useState } from 'react';
import { Card, Button } from '../App';
import { 
  Sparkles, FileText, CheckCircle2, AlertCircle, 
  Loader2, Calendar, Clock, Users, MapPin,
  ChevronDown, ChevronUp, Trash2, Save
} from 'lucide-react';

interface EscalaInput {
  matricula: string;
  email_staff: string;
  cnes?: string;
  hospital?: string;
  setor: string;
  data: string;
  periodo: 'MANHA' | 'TARDE' | 'NOITE';
  carga_horaria: number;
}

interface Props {
  onImportSuccess?: () => void;
}

export const ImportacaoEscalas: React.FC<Props> = ({ onImportSuccess }) => {
  const [textoIA, setTextoIA] = useState('');
  const [escalasProcessadas, setEscalasProcessadas] = useState<EscalaInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ 
    success: boolean; 
    message: string; 
    erros?: string[];
    resultados?: any[];
  } | null>(null);
  const [expanded, setExpanded] = useState(true);

  // ==============================================
  // EXEMPLOS PRONTOS PARA TESTE
  // ==============================================
  
  const exemplos = {
    csv: `matricula;email_staff;cnes;setor;data;periodo;carga
0016451;maria.silva@medpoint.com;1234567;UTI Neonatal;2026-03-10;MANHA;6
0016452;joao.santos@medpoint.com;7654321;Pediatria;2026-03-10;TARDE;6
0016453;ana.oliveira@medpoint.com;1122334;Ginecologia;2026-03-11;MANHA;6
0016454;carlos.souza@medpoint.com;4433221;Clínica Médica;2026-03-11;TARDE;6`,

    texto: `Escala da Semana - HRAN/HRT

SEGUNDA-FEIRA (10/03/2026)
- João Pedro (0016451) - UTI Neonatal - Dra. Maria Silva - Manhã
- Ana Beatriz (0016452) - Pediatria - Dr. João Santos - Tarde

TERÇA-FEIRA (11/03/2026)
- Lucas Mendes (0016453) - Ginecologia - Dra. Ana Oliveira - Manhã
- Carla Ferreira (0016454) - Clínica Médica - Dr. Carlos Souza - Tarde`,

    json: `[
  {
    "matricula": "0016451",
    "email_staff": "maria.silva@medpoint.com",
    "cnes": "1234567",
    "hospital": "HRAN",
    "setor": "UTI Neonatal",
    "data": "2026-03-10",
    "periodo": "MANHA",
    "carga_horaria": 6
  },
  {
    "matricula": "0016452",
    "email_staff": "joao.santos@medpoint.com",
    "cnes": "7654321",
    "hospital": "HRT",
    "setor": "Pediatria",
    "data": "2026-03-10",
    "periodo": "TARDE",
    "carga_horaria": 6
  }
]`
  };

  // ==============================================
  // PROCESSADORES DE TEXTO
  // ==============================================

  const processarCSV = (texto: string): EscalaInput[] => {
    const linhas = texto.split('\n').filter(l => l.trim());
    const cabecalho = linhas[0].toLowerCase();
    const dados = linhas.slice(1);
    
    // Verificar se tem cabeçalho ou é só dados
    const temCabecalho = cabecalho.includes('matricula') || 
                        cabecalho.includes('email') || 
                        cabecalho.includes('setor');
    
    const linhasDados = temCabecalho ? dados : linhas;
    
    return linhasDados.map(linha => {
      const cols = linha.split(';').map(c => c.trim());
      
      // Formato: matricula;email;cnes;setor;data;periodo;carga
      return {
        matricula: cols[0] || '',
        email_staff: cols[1] || '',
        cnes: cols[2] || '',
        setor: cols[3] || '',
        data: cols[4] || '',
        periodo: (cols[5]?.toUpperCase() as any) || 'MANHA',
        carga_horaria: parseFloat(cols[6]) || 6
      };
    }).filter(e => e.matricula && e.email_staff);
  };

  const processarTextoNatural = (texto: string): EscalaInput[] => {
    const linhas = texto.split('\n');
    const escalas: EscalaInput[] = [];
    
    // Expressões regulares para encontrar padrões
    const regexMatricula = /(\d{7})|(\d{6})|(\d{5})/g;
    const regexEmail = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/g;
    const regexData = /(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/g;
    const regexPeriodo = /(manh[ãa]|tarde|noite)/gi;
    const regexSetor = /(UTI|Pediatria|Ginecologia|Clínica|Cirurgia|Emergência)/gi;
    
    let currentData = '';
    let currentPeriodo = '';
    
    linhas.forEach(linha => {
      // Tentar extrair data
      const dataMatch = linha.match(regexData);
      if (dataMatch) {
        currentData = dataMatch[0].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1');
      }
      
      // Tentar extrair período
      const periodoMatch = linha.match(regexPeriodo);
      if (periodoMatch) {
        currentPeriodo = periodoMatch[0].toUpperCase();
      }
      
      // Tentar extrair matrícula
      const matriculaMatch = linha.match(regexMatricula);
      const emailMatch = linha.match(regexEmail);
      const setorMatch = linha.match(regexSetor);
      
      if (matriculaMatch && emailMatch && setorMatch && currentData) {
        escalas.push({
          matricula: matriculaMatch[0],
          email_staff: emailMatch[0],
          setor: setorMatch[0],
          data: currentData,
          periodo: currentPeriodo as any || 'MANHA',
          carga_horaria: 6,
          cnes: '',
          hospital: linha.includes('HRAN') ? 'HRAN' : linha.includes('HRT') ? 'HRT' : ''
        });
      }
    });
    
    return escalas;
  };

  const processarJSON = (texto: string): EscalaInput[] => {
    try {
      return JSON.parse(texto);
    } catch {
      return [];
    }
  };

  // ==============================================
  // FUNÇÃO PRINCIPAL DE PROCESSAMENTO
  // ==============================================

  const processarTexto = () => {
    setLoading(true);
    setResultado(null);
    
    try {
      let escalas: EscalaInput[] = [];
      
      // Tentar como JSON primeiro
      if (textoIA.trim().startsWith('[') || textoIA.trim().startsWith('{')) {
        escalas = processarJSON(textoIA);
      }
      
      // Tentar como CSV se não achou
      if (escalas.length === 0 && textoIA.includes(';')) {
        escalas = processarCSV(textoIA);
      }
      
      // Tentar como texto natural se não achou
      if (escalas.length === 0) {
        escalas = processarTextoNatural(textoIA);
      }
      
      setEscalasProcessadas(escalas);
      
      if (escalas.length === 0) {
        setResultado({
          success: false,
          message: 'Nenhuma escala encontrada no texto. Verifique o formato.'
        });
      } else {
        setResultado({
          success: true,
          message: `${escalas.length} escalas processadas. Revise antes de salvar.`
        });
      }
    } catch (error) {
      setResultado({
        success: false,
        message: 'Erro ao processar texto: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // SALVAR NO BANCO
  // ==============================================

  const salvarEscalas = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/escalas/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalas: escalasProcessadas })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResultado({
          success: true,
          message: data.message,
          erros: data.erros,
          resultados: data.resultados
        });
        setEscalasProcessadas([]);
        setTextoIA('');
        if (onImportSuccess) onImportSuccess();
      } else {
        setResultado({
          success: false,
          message: data.error || 'Erro ao salvar escalas'
        });
      }
    } catch (error) {
      setResultado({
        success: false,
        message: 'Erro de conexão: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // EDITAR MANUALMENTE
  // ==============================================

  const atualizarEscala = (index: number, campo: keyof EscalaInput, valor: string) => {
    const novas = [...escalasProcessadas];
    if (campo === 'carga_horaria') {
      novas[index][campo] = parseFloat(valor) || 0;
    } else if (campo === 'periodo') {
      novas[index][campo] = valor.toUpperCase() as any;
    } else {
      (novas[index][campo] as any) = valor;
    }
    setEscalasProcessadas(novas);
  };

  const removerEscala = (index: number) => {
    setEscalasProcessadas(escalasProcessadas.filter((_, i) => i !== index));
  };

  const limparTudo = () => {
    setEscalasProcessadas([]);
    setTextoIA('');
    setResultado(null);
  };

  // ==============================================
  // CARREGAR EXEMPLOS
  // ==============================================

  const carregarExemplo = (tipo: 'csv' | 'texto' | 'json') => {
    setTextoIA(exemplos[tipo]);
  };

  return (
    <div className="space-y-6">
      {/* Área de Importação */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-uniceplac-green" size={24} />
            <h2 className="text-xl font-bold">Importação de Escalas</h2>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="p-2 hover:bg-zinc-100 rounded-lg">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        {expanded && (
          <>
            <p className="text-sm text-zinc-600">
              Cole aqui a escala em qualquer formato (CSV, JSON, ou texto natural).
              O sistema vai extrair automaticamente os dados.
            </p>
            
            <div className="flex gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={() => carregarExemplo('csv')}>
                Exemplo CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => carregarExemplo('texto')}>
                Exemplo Texto
              </Button>
              <Button variant="outline" size="sm" onClick={() => carregarExemplo('json')}>
                Exemplo JSON
              </Button>
              <Button variant="outline" size="sm" onClick={limparTudo}>
                Limpar
              </Button>
            </div>
            
            <textarea
              value={textoIA}
              onChange={(e) => setTextoIA(e.target.value)}
              placeholder="Cole aqui a escala..."
              className="w-full h-40 p-4 border rounded-xl text-sm font-mono bg-zinc-50"
            />
            
            <Button 
              onClick={processarTexto} 
              disabled={loading || !textoIA}
              className="w-full"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={18} />}
              {loading ? 'Processando...' : 'Processar Texto'}
            </Button>
          </>
        )}
      </Card>

      {/* Resultado do Processamento */}
      {resultado && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            {resultado.success ? (
              <CheckCircle2 className="text-emerald-500 mt-1 flex-shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
            )}
            <div className="flex-1">
              <p className={resultado.success ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                {resultado.message}
              </p>
              {resultado.erros && resultado.erros.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-zinc-700">Erros encontrados:</p>
                  <ul className="text-xs text-red-500 list-disc pl-4 mt-1">
                    {resultado.erros.map((erro, i) => (
                      <li key={i}>{erro}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Escalas Processadas (para revisão manual) */}
      {escalasProcessadas.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileText size={20} />
              Escalas Encontradas ({escalasProcessadas.length})
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={limparTudo}>
                <Trash2 size={16} className="mr-1" /> Limpar
              </Button>
              <Button onClick={salvarEscalas} disabled={loading} size="sm">
                <Save size={16} className="mr-1" />
                Salvar no Banco
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-2 text-left">Matrícula</th>
                  <th className="p-2 text-left">Staff</th>
                  <th className="p-2 text-left">Setor</th>
                  <th className="p-2 text-left">Hospital</th>
                  <th className="p-2 text-left">Data</th>
                  <th className="p-2 text-left">Período</th>
                  <th className="p-2 text-left">Carga</th>
                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {escalasProcessadas.map((escala, index) => (
                  <tr key={index} className="border-t hover:bg-zinc-50">
                    <td className="p-2">
                      <input
                        value={escala.matricula}
                        onChange={(e) => atualizarEscala(index, 'matricula', e.target.value)}
                        className="w-24 p-1 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={escala.email_staff}
                        onChange={(e) => atualizarEscala(index, 'email_staff', e.target.value)}
                        className="w-40 p-1 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={escala.setor}
                        onChange={(e) => atualizarEscala(index, 'setor', e.target.value)}
                        className="w-32 p-1 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={escala.hospital || ''}
                        onChange={(e) => atualizarEscala(index, 'hospital', e.target.value)}
                        className="w-20 p-1 border rounded"
                        placeholder="HRAN"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={escala.data}
                        onChange={(e) => atualizarEscala(index, 'data', e.target.value)}
                        className="w-24 p-1 border rounded"
                        type="date"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={escala.periodo}
                        onChange={(e) => atualizarEscala(index, 'periodo', e.target.value)}
                        className="p-1 border rounded"
                      >
                        <option value="MANHA">Manhã</option>
                        <option value="TARDE">Tarde</option>
                        <option value="NOITE">Noite</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        value={escala.carga_horaria}
                        onChange={(e) => atualizarEscala(index, 'carga_horaria', e.target.value)}
                        className="w-16 p-1 border rounded"
                        type="number"
                        step="0.5"
                      />
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => removerEscala(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={salvarEscalas} disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
              Confirmar e Salvar Todas
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};