import React, { useState } from 'react';
import { db } from '../db';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { Card, Button } from '../App';
import { 
  Sparkles, FileText, CheckCircle2, AlertCircle, 
  Loader2, Save, X, Trash2, Brain, Calendar,
  Users, MapPin, Mail, Hash, Clock
} from 'lucide-react';

interface EscalaInput {
  matricula: string;
  email_staff: string;
  cnes?: string;
  hospital?: string;
  setor: string;
  data: string;
  periodo: string;
  carga_horaria: number;
}

interface Props {
  onEscalaSalva?: () => void;
}

export const ImportacaoInteligente: React.FC<Props> = ({ onEscalaSalva }) => {
  const [textoEntrada, setTextoEntrada] = useState('');
  const [escalasProcessadas, setEscalasProcessadas] = useState<EscalaInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<{
    success: boolean;
    message: string;
    erros?: string[];
  } | null>(null);

  // ==============================================
  // PROCESSADOR INTELIGENTE DE TEXTOS
  // ==============================================
  const processarTexto = () => {
    setProcessando(true);
    setResultado(null);
    
    try {
      const texto = textoEntrada.trim();
      let escalas: EscalaInput[] = [];
      
      // 1. TENTAR COMO JSON
      if (texto.startsWith('[') || texto.startsWith('{')) {
        try {
          const jsonData = JSON.parse(texto);
          escalas = Array.isArray(jsonData) ? jsonData : [jsonData];
        } catch (e) {
          // Não é JSON válido, continua para próximas tentativas
        }
      }
      
      // 2. TENTAR COMO CSV (com ou sem cabeçalho)
      if (escalas.length === 0 && texto.includes(';')) {
        const linhas = texto.split('\n').filter(l => l.trim());
        const primeiraLinha = linhas[0].toLowerCase();
        
        // Verificar se tem cabeçalho
        const temCabecalho = primeiraLinha.includes('matricula') || 
                            primeiraLinha.includes('email') || 
                            primeiraLinha.includes('setor');
        
        const dados = temCabecalho ? linhas.slice(1) : linhas;
        
        escalas = dados.map(linha => {
          const cols = linha.split(';').map(c => c.trim());
          return {
            matricula: cols[0] || '',
            email_staff: cols[1] || '',
            cnes: cols[2] || '',
            setor: cols[3] || '',
            data: cols[4] || new Date().toISOString().split('T')[0],
            periodo: (cols[5] || 'MANHA').toUpperCase().replace('Ã', 'A'),
            carga_horaria: parseFloat(cols[6]) || 6
          };
        }).filter(e => e.matricula && e.email_staff);
      }
      
      // 3. TENTAR COMO TEXTO ESTRUTURADO
      if (escalas.length === 0) {
        const regexMatricula = /(\d{7}|\d{6}|\d{5})/g;
        const regexEmail = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/g;
        const regexData = /(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/g;
        const regexPeriodo = /(manh[ãa]|tarde|noite)/gi;
        const regexSetor = /(UTI|Pediatria|Ginecologia|Clínica|Cirurgia|Emergência|Enfermaria)/gi;
        const regexHospital = /(HRAN|HRT|HUB|HRL)/gi;
        
        const linhas = texto.split('\n');
        let escalaAtual: Partial<EscalaInput> = {};
        
        linhas.forEach(linha => {
          // Extrair matrícula
          const matriculaMatch = linha.match(regexMatricula);
          if (matriculaMatch) escalaAtual.matricula = matriculaMatch[0];
          
          // Extrair email
          const emailMatch = linha.match(regexEmail);
          if (emailMatch) escalaAtual.email_staff = emailMatch[0];
          
          // Extrair data
          const dataMatch = linha.match(regexData);
          if (dataMatch) {
            let data = dataMatch[0];
            if (data.includes('/')) {
              const [dia, mes, ano] = data.split('/');
              data = `${ano}-${mes}-${dia}`;
            }
            escalaAtual.data = data;
          }
          
          // Extrair período
          const periodoMatch = linha.match(regexPeriodo);
          if (periodoMatch) {
            escalaAtual.periodo = periodoMatch[0].toUpperCase().replace('Ã', 'A');
          }
          
          // Extrair setor
          const setorMatch = linha.match(regexSetor);
          if (setorMatch) escalaAtual.setor = setorMatch[0];
          
          // Extrair hospital
          const hospitalMatch = linha.match(regexHospital);
          if (hospitalMatch) escalaAtual.hospital = hospitalMatch[0];
          
          // Se encontrou matrícula e email, adiciona à lista
          if (escalaAtual.matricula && escalaAtual.email_staff) {
            escalas.push({
              matricula: escalaAtual.matricula,
              email_staff: escalaAtual.email_staff,
              setor: escalaAtual.setor || 'UTI',
              data: escalaAtual.data || new Date().toISOString().split('T')[0],
              periodo: escalaAtual.periodo || 'MANHA',
              carga_horaria: 6,
              cnes: '',
              hospital: escalaAtual.hospital || ''
            });
            escalaAtual = {};
          }
        });
      }
      
      // 4. Se ainda não encontrou, tentar formato de lista simples
      if (escalas.length === 0) {
        const linhas = texto.split('\n');
        linhas.forEach(linha => {
          // Procurar por padrões como "João Pedro (0016451) - UTI - maria.silva@medpoint.com"
          const match = linha.match(/(\d{6,7}).*?([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+).*?(UTI|Pediatria|Ginecologia)/i);
          
          if (match) {
            escalas.push({
              matricula: match[1],
              email_staff: match[2],
              setor: match[3],
              data: new Date().toISOString().split('T')[0],
              periodo: 'MANHA',
              carga_horaria: 6,
              cnes: '',
              hospital: ''
            });
          }
        });
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
          message: `${escalas.length} escala(s) processada(s). Revise antes de salvar.`
        });
      }
    } catch (error) {
      setResultado({
        success: false,
        message: 'Erro ao processar: ' + (error as Error).message
      });
    } finally {
      setProcessando(false);
    }
  };

  // ==============================================
  // SALVAR NO BANCO
  // ==============================================
  const salvarEscalas = async () => {
    setLoading(true);
    const erros: string[] = [];
    let salvos = 0;

    try {
      for (const escala of escalasProcessadas) {
        try {
          // Gerar ID único baseado na matrícula + data + período
          const id = `${escala.matricula}_${escala.data}_${escala.periodo}`;
          
          await setDoc(doc(db, "Escalas", id), {
            aluno_id: escala.matricula,
            aluno_nome: "Aguardando nome", // Será atualizado depois
            staff_id: escala.email_staff,
            staff_nome: "Aguardando nome", // Será atualizado depois
            cnes: escala.cnes || '',
            hospital: escala.hospital || '',
            setor: escala.setor,
            data: escala.data,
            periodo: escala.periodo,
            carga_horaria: escala.carga_horaria,
            dataCadastro: new Date().toISOString()
          });
          
          salvos++;
        } catch (error) {
          erros.push(`Erro ao salvar escala ${escala.matricula}: ${(error as Error).message}`);
        }
      }

      if (salvos > 0) {
        setResultado({
          success: true,
          message: `${salvos} escala(s) salva(s) com sucesso!`,
          erros: erros.length > 0 ? erros : undefined
        });
        setEscalasProcessadas([]);
        setTextoEntrada('');
        if (onEscalaSalva) onEscalaSalva();
      } else {
        setResultado({
          success: false,
          message: 'Nenhuma escala foi salva.',
          erros
        });
      }
    } catch (error) {
      setResultado({
        success: false,
        message: 'Erro ao salvar: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // EXEMPLOS PRONTOS
  // ==============================================
  const carregarExemplo = (tipo: 'json' | 'csv' | 'texto') => {
    const exemplos = {
      json: `[
  {
    "matricula": "0016451",
    "email_staff": "maria.silva@medpoint.com",
    "cnes": "1234567",
    "setor": "UTI",
    "data": "2026-03-10",
    "periodo": "MANHA",
    "carga_horaria": 6
  },
  {
    "matricula": "0016452",
    "email_staff": "joao.santos@medpoint.com",
    "setor": "Pediatria",
    "data": "2026-03-10",
    "periodo": "TARDE",
    "carga_horaria": 6
  }
]`,
      csv: `matricula;email_staff;cnes;setor;data;periodo;carga
0016451;maria.silva@medpoint.com;1234567;UTI;2026-03-10;MANHA;6
0016452;joao.santos@medpoint.com;;Pediatria;2026-03-10;TARDE;6`,
      texto: `Escala do dia 10/03/2026:
- João Pedro (0016451) - UTI com Dra. Maria Silva (maria.silva@medpoint.com) - Manhã
- Ana Beatriz (0016452) - Pediatria com Dr. João Santos (joao.santos@medpoint.com) - Tarde`
    };
    
    setTextoEntrada(exemplos[tipo]);
  };

  const removerEscala = (index: number) => {
    setEscalasProcessadas(escalasProcessadas.filter((_, i) => i !== index));
  };

  const limparTudo = () => {
    setEscalasProcessadas([]);
    setTextoEntrada('');
    setResultado(null);
  };

  return (
    <div className="space-y-6">
      {/* Área de Entrada */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={24} className="text-uniceplac-green" />
          <h2 className="text-xl font-bold">Importação Inteligente</h2>
        </div>
        
        <p className="text-sm text-zinc-600 mb-4">
          Cole qualquer formato (JSON, CSV, texto livre). A IA vai interpretar automaticamente.
        </p>

        <div className="flex gap-2 mb-3 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => carregarExemplo('json')}>
            Exemplo JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => carregarExemplo('csv')}>
            Exemplo CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => carregarExemplo('texto')}>
            Exemplo Texto
          </Button>
          <Button variant="outline" size="sm" onClick={limparTudo}>
            Limpar
          </Button>
        </div>

        <textarea
          value={textoEntrada}
          onChange={(e) => setTextoEntrada(e.target.value)}
          placeholder="Cole aqui a escala em qualquer formato..."
          className="w-full h-40 p-4 border rounded-xl text-sm font-mono bg-zinc-50"
        />

        <Button
          onClick={processarTexto}
          disabled={processando || !textoEntrada}
          className="w-full mt-4"
        >
          {processando ? (
            <Loader2 className="animate-spin mr-2" size={18} />
          ) : (
            <Sparkles className="mr-2" size={18} />
          )}
          {processando ? 'Processando...' : 'Processar com IA'}
        </Button>
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
                  <p className="text-sm font-medium text-zinc-700">Erros:</p>
                  <ul className="text-xs text-red-500 list-disc pl-4">
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

      {/* Pré-visualização das Escalas */}
      {escalasProcessadas.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileText size={20} />
              Pré-visualização ({escalasProcessadas.length})
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={limparTudo}>
                <Trash2 size={16} className="mr-1" /> Limpar
              </Button>
              <Button onClick={salvarEscalas} disabled={loading} size="sm">
                {loading ? <Loader2 className="animate-spin mr-1" size={16} /> : <Save size={16} className="mr-1" />}
                Salvar no Banco
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {escalasProcessadas.map((escala, index) => (
              <div key={index} className="bg-uniceplac-green/5 p-4 rounded-xl relative">
                <button
                  onClick={() => removerEscala(index)}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X size={16} />
                </button>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Users size={12} /> Matrícula
                    </p>
                    <p className="font-medium">{escala.matricula}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Mail size={12} /> Staff
                    </p>
                    <p className="font-medium text-sm">{escala.email_staff}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <MapPin size={12} /> Local
                    </p>
                    <p className="font-medium">{escala.setor} {escala.hospital && `- ${escala.hospital}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar size={12} /> Data
                    </p>
                    <p className="font-medium">{new Date(escala.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={12} /> Período
                    </p>
                    <p className="font-medium">{escala.periodo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Hash size={12} /> Carga
                    </p>
                    <p className="font-medium">{escala.carga_horaria}h</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};