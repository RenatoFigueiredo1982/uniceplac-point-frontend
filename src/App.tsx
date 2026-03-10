import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  getDocs, 
  where, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  limit, 
  orderBy
} from "firebase/firestore";

import { db } from './db';
import { 
  Users, QrCode, LogOut, AlertCircle, 
  CheckCircle2, Clock, UserPlus, ShieldAlert,
  Search, FileText, Sparkles, Loader2, Book, LogIn,
  MapPin, Plus, X, Edit, Trash2, Camera, User,
  Calendar, Hash, Mail, Filter, RefreshCw, Download,
  ChevronDown, ChevronUp, Brain, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { Documentation } from './components/Documentation';

// --- TYPES ---
type Role = 'GESTOR' | 'STAFF' | 'ALUNO';
type View = 'LOGIN' | 'ADMIN' | 'STAFF' | 'STUDENT_LOGIN' | 'STUDENT_SCAN' | 'DOCUMENTATION';

interface User { id: string; nome: string; email: string; role: Role; }
interface Aluno { id: string; nome: string; matricula: string; turma: string; carga_horaria_alvo: number; horas_concluidas: number; }
interface Escala { id: string; aluno_id: string; aluno_nome: string; staff_id: string; staff_nome: string; cnes: string; hospital: string; setor: string; data: string; periodo: string; carga_horaria: number; }
interface Staff { id: string; nome: string; email: string; }
interface Setor { id: string; nome: string; hospital: string; cnes: string; ativo: boolean; }
interface PontoRecord { id: string; aluno_nome: string; aluno_matricula: string; setor: string; data_plantao: string; hora_entrada: string; hora_saida: string | null; horas_totais: number | null; staff_entrada_nome: string; staff_saida_nome: string | null; is_sos_entrada: boolean; is_sos_saida: boolean; observacao: string | null; }

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

// --- COMPONENTS ---
const Logo = ({ size = 48, className = "" }: { size?: number, className?: string }) => (
  <img src="./logo-oficial.png" alt="Logo" width={size} height={size} className={`object-contain ${className}`} />
);

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl border border-uniceplac-green/5 shadow-sm overflow-hidden ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false }: any) => {
  const variants: any = {
    primary: 'bg-uniceplac-green text-white hover:bg-uniceplac-green/90',
    secondary: 'bg-uniceplac-mint/20 text-uniceplac-green hover:bg-uniceplac-mint/40',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-uniceplac-green/20 text-uniceplac-green hover:bg-uniceplac-green/5'
  };
  return (
    <button disabled={disabled} onClick={onClick} className={`px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// ============================================================================
// COMPONENTE DE LOGIN DO ALUNO
// ============================================================================
const AlunoLogin = ({ onLoginSuccess, onBack }: { onLoginSuccess: (data: any) => void; onBack: () => void }) => {
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const q = query(collection(db, "Alunos"), where("matricula", "==", matricula));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const alunoData = snap.docs[0].data();
        onLoginSuccess({ 
          nome: alunoData.nome, 
          matricula: alunoData.matricula,
          id: snap.docs[0].id 
        });
      } else {
        if (nome) {
          const novoId = `aluno_${Date.now()}`;
          await setDoc(doc(db, "Alunos", novoId), {
            nome,
            matricula,
            turma: 'Não informada',
            carga_horaria_alvo: 120,
            horas_concluidas: 0,
            status: 'ativo',
            criadoEm: new Date().toISOString()
          });
          onLoginSuccess({ nome, matricula, id: novoId });
        } else {
          setError('Aluno não encontrado. Se for novo, preencha o nome.');
        }
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Logo size={80} className="mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-center text-uniceplac-green mb-2">Acesso do Aluno</h1>
      <p className="text-center text-zinc-500 mb-6">Informe seus dados para acessar o sistema</p>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Matrícula</label>
            <input
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              placeholder="Digite sua matrícula"
              required
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-uniceplac-green/20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome (se for novo aluno)"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-uniceplac-green/20"
            />
            <p className="text-xs text-zinc-400 mt-1">Se for aluno novo, preencha o nome para se cadastrar</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Entrando...' : 'Entrar como Aluno'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={onBack} className="text-sm text-uniceplac-green hover:underline">
            ← Voltar ao login principal
          </button>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// COMPONENTE DE SCANNER DO ALUNO (CORRIGIDO)
// ============================================================================
const AlunoScanner = ({ studentData, onLogout }: { studentData: any; onLogout: () => void }) => {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [pontoRegistrado, setPontoRegistrado] = useState(false);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!pontoRegistrado && scannerContainerRef.current) {
      if (scannerContainerRef.current) {
        scannerContainerRef.current.innerHTML = '';
      }

      scannerRef.current = new Html5QrcodeScanner(
        "reader", 
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2
        }, 
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [pontoRegistrado]);

  const onScanSuccess = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      handlePonto(data);
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      setScanned(true);
    } catch (e) {
      alert("QR Code inválido");
    }
  };

  const onScanError = (error: any) => {
    console.debug('Erro de scan:', error);
  };

  const handlePonto = async (qrData: any) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/bater-ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aluno_matricula: studentData.matricula,
          aluno_nome: studentData.nome,
          staff_id: qrData.staff_id,
          setor: qrData.setor,
          token_seguranca_qr: qrData.token,
          is_sos: false
        })
      });
      
      const data = await response.json();
      setResult(data);
      setPontoRegistrado(true);
    } catch (err) {
      setResult({ error: 'Erro de conexão com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  const novoRegistro = () => {
    setScanned(false);
    setPontoRegistrado(false);
    setResult(null);
    if (scannerContainerRef.current) {
      scannerContainerRef.current.innerHTML = '';
      scannerRef.current = new Html5QrcodeScanner(
        "reader", 
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        }, 
        false
      );
      scannerRef.current.render(onScanSuccess, onScanError);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <Logo size={32} />
        <h1 className="text-lg font-bold text-uniceplac-green">Registrar Ponto</h1>
        <Button onClick={onLogout} variant="outline" className="p-2">
          <LogOut size={18} />
        </Button>
      </header>
      
      <div className="mb-4 p-4 bg-uniceplac-green/5 rounded-lg text-center">
        <p className="font-medium text-uniceplac-green">{studentData.nome}</p>
        <p className="text-sm text-zinc-500">Matrícula: {studentData.matricula}</p>
      </div>

      {!pontoRegistrado ? (
        <div>
          <div 
            id="reader" 
            ref={scannerContainerRef}
            className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden border-4 border-white shadow-xl"
            style={{ minHeight: '300px' }}
          />
          <p className="text-center text-zinc-500 mt-4">
            {scanned && loading ? 'Processando...' : 'Aponte para o QR Code do Staff'}
          </p>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto text-uniceplac-green" size={48} />
          <p className="mt-4 text-zinc-600">Registrando ponto...</p>
        </div>
      ) : result?.error ? (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <p className="mt-4 text-red-600 font-medium">{result.error}</p>
          <Button onClick={novoRegistro} className="mt-6 w-full">
            Tentar Novamente
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
          <p className="mt-4 text-emerald-600 font-bold text-lg">
            {result?.tipo === 'SAIDA' ? 'Saída Registrada!' : 'Entrada Registrada!'}
          </p>
          <p className="text-sm text-zinc-600 mt-2">{result?.message}</p>
          {result?.horas && (
            <p className="text-sm font-bold text-uniceplac-green mt-2">Total: {result.horas}h</p>
          )}
          <div className="flex gap-3 mt-6">
            <Button onClick={novoRegistro} className="flex-1">
              Novo Registro
            </Button>
            <Button onClick={onLogout} variant="outline" className="flex-1">
              Sair
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE DE IMPORTAÇÃO INTELIGENTE DE ESCALAS
// ============================================================================
const ImportacaoInteligente: React.FC<{ onEscalaSalva?: () => void }> = ({ onEscalaSalva }) => {
  const [textoEntrada, setTextoEntrada] = useState('');
  const [escalasProcessadas, setEscalasProcessadas] = useState<EscalaInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<{
    success: boolean;
    message: string;
    erros?: string[];
  } | null>(null);

  const processarTexto = () => {
    setProcessando(true);
    setResultado(null);
    
    try {
      const texto = textoEntrada.trim();
      let escalas: EscalaInput[] = [];
      
      if (texto.startsWith('[') || texto.startsWith('{')) {
        try {
          const jsonData = JSON.parse(texto);
          escalas = Array.isArray(jsonData) ? jsonData : [jsonData];
        } catch (e) {}
      }
      
      if (escalas.length === 0 && texto.includes(';')) {
        const linhas = texto.split('\n').filter(l => l.trim());
        const primeiraLinha = linhas[0].toLowerCase();
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
          const matriculaMatch = linha.match(regexMatricula);
          if (matriculaMatch) escalaAtual.matricula = matriculaMatch[0];
          
          const emailMatch = linha.match(regexEmail);
          if (emailMatch) escalaAtual.email_staff = emailMatch[0];
          
          const dataMatch = linha.match(regexData);
          if (dataMatch) {
            let data = dataMatch[0];
            if (data.includes('/')) {
              const [dia, mes, ano] = data.split('/');
              data = `${ano}-${mes}-${dia}`;
            }
            escalaAtual.data = data;
          }
          
          const periodoMatch = linha.match(regexPeriodo);
          if (periodoMatch) {
            escalaAtual.periodo = periodoMatch[0].toUpperCase().replace('Ã', 'A');
          }
          
          const setorMatch = linha.match(regexSetor);
          if (setorMatch) escalaAtual.setor = setorMatch[0];
          
          const hospitalMatch = linha.match(regexHospital);
          if (hospitalMatch) escalaAtual.hospital = hospitalMatch[0];
          
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

  const salvarEscalas = async () => {
    setLoading(true);
    const erros: string[] = [];
    let salvos = 0;

    try {
      for (const escala of escalasProcessadas) {
        try {
          const id = `${escala.matricula}_${escala.data}_${escala.periodo}`;
          
          await setDoc(doc(db, "Escalas", id), {
            aluno_id: escala.matricula,
            aluno_nome: "Aguardando nome",
            staff_id: escala.email_staff,
            staff_nome: "Aguardando nome",
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

          <div className="space-y-3 max-h-96 overflow-y-auto">
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

// ============================================================================
// COMPONENTE DE VISUALIZAÇÃO DE ESCALAS (ESTILO PRISMA)
// ============================================================================
const VisualizacaoEscalas: React.FC<{ 
  escalas: Escala[];
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (escala: Escala) => void;
}> = ({ escalas, onRefresh, onDelete, onEdit }) => {
  const [filtro, setFiltro] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [ordenarPor, setOrdenarPor] = useState<'data' | 'aluno' | 'setor'>('data');
  const [ordenarDirecao, setOrdenarDirecao] = useState<'asc' | 'desc'>('asc');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [escalaEditando, setEscalaEditando] = useState<Partial<Escala>>({});

  const escalasFiltradas = escalas.filter(escala => {
    const matchGeral = !filtro || 
      escala.aluno_nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      escala.staff_nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      escala.setor?.toLowerCase().includes(filtro.toLowerCase());
    
    const matchData = !filtroData || escala.data === filtroData;
    const matchPeriodo = !filtroPeriodo || escala.periodo === filtroPeriodo;
    
    return matchGeral && matchData && matchPeriodo;
  });

  const escalasOrdenadas = [...escalasFiltradas].sort((a, b) => {
    let comparacao = 0;
    switch (ordenarPor) {
      case 'data':
        comparacao = (a.data || '').localeCompare(b.data || '');
        break;
      case 'aluno':
        comparacao = (a.aluno_nome || '').localeCompare(b.aluno_nome || '');
        break;
      case 'setor':
        comparacao = (a.setor || '').localeCompare(b.setor || '');
        break;
    }
    return ordenarDirecao === 'asc' ? comparacao : -comparacao;
  });

  const toggleOrdenacao = (campo: typeof ordenarPor) => {
    if (ordenarPor === campo) {
      setOrdenarDirecao(ordenarDirecao === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenarPor(campo);
      setOrdenarDirecao('asc');
    }
  };

  const iniciarEdicao = (escala: Escala) => {
    setEditandoId(escala.id);
    setEscalaEditando(escala);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEscalaEditando({});
  };

  const salvarEdicao = (id: string) => {
    if (onEdit && escalaEditando) {
      onEdit({ ...escalaEditando, id } as Escala);
    }
    setEditandoId(null);
    setEscalaEditando({});
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Filtrar..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64"
              />
            </div>
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Todos períodos</option>
              <option value="MANHA">Manhã</option>
              <option value="TARDE">Tarde</option>
              <option value="NOITE">Noite</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw size={16} className="mr-1" />
              Atualizar
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-uniceplac-green/5 p-3 rounded-lg">
            <p className="text-xs text-zinc-500">Total de Escalas</p>
            <p className="text-2xl font-bold text-uniceplac-green">{escalas.length}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-zinc-500">Hoje</p>
            <p className="text-2xl font-bold text-blue-600">
              {escalas.filter(e => e.data === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-xs text-zinc-500">Manhã</p>
            <p className="text-2xl font-bold text-amber-600">
              {escalas.filter(e => e.periodo === 'MANHA').length}
            </p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg">
            <p className="text-xs text-zinc-500">Tarde/Noite</p>
            <p className="text-2xl font-bold text-emerald-600">
              {escalas.filter(e => e.periodo !== 'MANHA').length}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b-2 border-zinc-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100"
                    onClick={() => toggleOrdenacao('aluno')}>
                  <div className="flex items-center gap-1">
                    <Users size={14} /> Aluno
                    {ordenarPor === 'aluno' && (
                      <span>{ordenarDirecao === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Mail size={14} /> Staff
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100"
                    onClick={() => toggleOrdenacao('setor')}>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} /> Local
                    {ordenarPor === 'setor' && (
                      <span>{ordenarDirecao === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100"
                    onClick={() => toggleOrdenacao('data')}>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} /> Data
                    {ordenarPor === 'data' && (
                      <span>{ordenarDirecao === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Clock size={14} /> Período
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Hash size={14} /> Carga
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {escalasOrdenadas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center">
                      <Calendar size={32} className="text-zinc-300 mb-2" />
                      <p>Nenhuma escala encontrada</p>
                      <p className="text-xs">Use a importação para adicionar escalas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                escalasOrdenadas.map((escala) => (
                  <tr key={escala.id} className="hover:bg-zinc-50/50 transition-colors">
                    {editandoId === escala.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            value={escalaEditando.aluno_nome || ''}
                            onChange={(e) => setEscalaEditando({...escalaEditando, aluno_nome: e.target.value})}
                            className="w-full p-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={escalaEditando.staff_nome || ''}
                            onChange={(e) => setEscalaEditando({...escalaEditando, staff_nome: e.target.value})}
                            className="w-full p-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={escalaEditando.setor || ''}
                            onChange={(e) => setEscalaEditando({...escalaEditando, setor: e.target.value})}
                            className="w-full p-1 border rounded text-sm"
                          />
                          <input
                            value={escalaEditando.hospital || ''}
                            onChange={(e) => setEscalaEditando({...escalaEditando, hospital: e.target.value})}
                            className="w-full p-1 border rounded text-sm mt-1"
                            placeholder="Hospital"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={escalaEditando.data || ''}
                            onChange={(e) => setEscalaEditando({...escalaEditando, data: e.target.value})}
                            className="w-full p-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={escalaEditando.periodo || ''}
                            onChange={(e) => setEscalaEditando({...escalaEditando, periodo: e.target.value})}
                            className="w-full p-1 border rounded text-sm"
                          >
                            <option value="MANHA">Manhã</option>
                            <option value="TARDE">Tarde</option>
                            <option value="NOITE">Noite</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={escalaEditando.carga_horaria || 6}
                            onChange={(e) => setEscalaEditando({...escalaEditando, carga_horaria: parseFloat(e.target.value)})}
                            className="w-20 p-1 border rounded text-sm"
                            step="0.5"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => salvarEdicao(escala.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Salvar"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={cancelarEdicao}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Cancelar"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <div className="font-medium">{escala.aluno_nome}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{escala.staff_nome}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{escala.setor}</div>
                          <div className="text-xs text-zinc-400">{escala.hospital}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{new Date(escala.data).toLocaleDateString('pt-BR')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${escala.periodo === 'MANHA' ? 'bg-amber-100 text-amber-700' : 
                              escala.periodo === 'TARDE' ? 'bg-blue-100 text-blue-700' : 
                              'bg-purple-100 text-purple-700'}`}>
                            {escala.periodo}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-uniceplac-green">
                          {escala.carga_horaria}h
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => iniciarEdicao(escala)}
                              className="p-1 text-zinc-500 hover:text-uniceplac-green hover:bg-uniceplac-green/5 rounded"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            {onDelete && (
                              <button
                                onClick={() => onDelete(escala.id)}
                                className="p-1 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-3 bg-zinc-50 border-t flex items-center justify-between text-xs text-zinc-500">
          <div>
            Exibindo {escalasOrdenadas.length} de {escalas.length} escalas
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function App() {
  const [view, setView] = useState<View>('LOGIN');
  const [prevView, setPrevView] = useState<View>('LOGIN');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [studentData, setStudentData] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setLoading(true);
    setError('');

    if (email === 'admin@medpoint.com' && password === 'admin123') {
      setTimeout(() => {
        setUser({ id: '1', nome: 'Administrador', email, role: 'GESTOR' });
        setView('ADMIN');
        setLoading(false);
      }, 800);
      return;
    }

    if (email === 'maria.silva@medpoint.com' && password === 'staff123') {
      setTimeout(() => {
        setUser({ id: '2', nome: 'Dra. Maria Silva', email, role: 'STAFF' });
        setView('STAFF');
        setLoading(false);
      }, 800);
      return;
    }

    if (email === 'joao.santos@medpoint.com' && password === 'staff123') {
      setTimeout(() => {
        setUser({ id: '3', nome: 'Dr. João Santos', email, role: 'STAFF' });
        setView('STAFF');
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const q = query(collection(db, "Usuarios"), where("email", "==", email), where("senha", "==", password));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setUser({ id: snap.docs[0].id, nome: data.nome, email: data.email, role: data.perfil === 'gestor' ? 'GESTOR' : 'STAFF' });
        setView(data.perfil === 'gestor' ? 'ADMIN' : 'STAFF');
      } else {
        setError('Credenciais inválidas');
      }
    } catch (err) {
      setError('Erro ao conectar');
    } finally {
      setLoading(false);
    }
  };

  const handleAlunoLogin = (data: any) => {
    setStudentData(data);
    setView('STUDENT_SCAN');
  };

  const handleAlunoLogout = () => {
    setStudentData(null);
    setView('LOGIN');
  };

  const logout = () => { setUser(null); setView('LOGIN'); };
  const navigateToDoc = () => { setPrevView(view); setView('DOCUMENTATION'); };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans">
      <AnimatePresence mode="wait">
        {view === 'LOGIN' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <Logo size={80} className="mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-uniceplac-green">UNICEPLAC - POINT</h1>
                <p className="text-zinc-500 mt-2">Sistema de Internato Hospitalar</p>
              </div>

              <Card className="p-8 space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <h2 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
                    <Users size={20} /> Acesso Staff/Gestor
                  </h2>
                  <input name="email" type="email" placeholder="Email institucional" required className="w-full p-3 border rounded-xl" />
                  <input name="password" type="password" placeholder="Senha" required className="w-full p-3 border rounded-xl" />
                  {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                  <Button className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-zinc-400">Ou</span></div>
                </div>

                <Button 
                  variant="secondary" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setView('STUDENT_LOGIN')}
                >
                  <User size={18} /> Acesso do Aluno
                </Button>

                <button onClick={navigateToDoc} className="w-full text-xs text-zinc-400 hover:text-uniceplac-green flex items-center justify-center gap-1">
                  <Book size={14} /> Documentação
                </button>
              </Card>
              
              <p className="text-center text-xs text-zinc-400">v1.0.0</p>
            </div>
          </motion.div>
        )}

        {view === 'STUDENT_LOGIN' && (
          <AlunoLogin 
            onLoginSuccess={handleAlunoLogin}
            onBack={() => setView('LOGIN')}
          />
        )}

        {view === 'STUDENT_SCAN' && studentData && (
          <AlunoScanner 
            studentData={studentData}
            onLogout={handleAlunoLogout}
          />
        )}

        {view === 'ADMIN' && user && <AdminDashboard user={user} onLogout={logout} navigateToDoc={navigateToDoc} />}
        {view === 'STAFF' && user && <StaffView user={user} onLogout={logout} navigateToDoc={navigateToDoc} />}
        {view === 'DOCUMENTATION' && <Documentation onBack={() => setView(prevView)} />}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================
function AdminDashboard({ user, onLogout, navigateToDoc }: any) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [relatorios, setRelatorios] = useState<PontoRecord[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [escalasList, setEscalasList] = useState<Escala[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [activeTab, setActiveTab] = useState<'RELATORIO' | 'CADASTRO' | 'ESCALAS'>('RELATORIO');
  const [filter, setFilter] = useState({ aluno: '', setor: '' });
  
  const [stats, setStats] = useState({
    totalPontos: 0,
    totalHoras: 0,
    mediaHoras: 0,
    alunosAtivos: 0,
    plantoesHoje: 0
  });

  const [showSetorModal, setShowSetorModal] = useState(false);
  const [editandoSetor, setEditandoSetor] = useState<Setor | null>(null);
  const [formSetor, setFormSetor] = useState({ nome: '', hospital: '', cnes: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alunosSnap, staffSnap, escalasSnap, setoresSnap] = await Promise.all([
          getDocs(collection(db, "Alunos")),
          getDocs(collection(db, "Usuarios")),
          getDocs(collection(db, "Escalas")),
          getDocs(collection(db, "Setores"))
        ]);
        
        const alunosData = alunosSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Aluno[];
        const staffData = staffSnap.docs.filter(d => d.data().perfil === 'staff').map(d => ({ id: d.id, ...d.data() })) as Staff[];
        const escalasData = escalasSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Escala[];
        const setoresData = setoresSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Setor[];
        
        setAlunos(alunosData);
        setStaffList(staffData);
        setEscalasList(escalasData);
        setSetores(setoresData);
        
        const hoje = new Date().toISOString().split('T')[0];
        const plantoesHoje = escalasData.filter(e => e.data === hoje).length;
        
        setStats(prev => ({
          ...prev,
          alunosAtivos: alunosData.length,
          plantoesHoje
        }));
        
      } catch (e) { console.error(e); }
    };
    fetchData();

    const qPontos = query(collection(db, "Pontos"), orderBy("hora_entrada", "desc"));
    const unsub = onSnapshot(qPontos, (snapshot) => {
      const pontosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PontoRecord[];
      setRelatorios(pontosData);
      
      const totalHoras = pontosData.reduce((acc, p) => acc + (p.horas_totais || 0), 0);
      setStats({
        totalPontos: pontosData.length,
        totalHoras: Math.round(totalHoras * 10) / 10,
        mediaHoras: pontosData.length > 0 ? Math.round((totalHoras / pontosData.length) * 10) / 10 : 0,
        alunosAtivos: alunos.length,
        plantoesHoje: escalasList.filter(e => e.data === new Date().toISOString().split('T')[0]).length
      });
    });

    return () => unsub();
  }, []);

  const filteredRelatorio = relatorios.filter(p => 
    (!filter.aluno || p.aluno_nome?.toLowerCase().includes(filter.aluno.toLowerCase()) || p.aluno_matricula?.includes(filter.aluno)) &&
    (!filter.setor || p.setor?.toLowerCase().includes(filter.setor.toLowerCase()))
  );

  const salvarSetor = async () => {
    try {
      if (editandoSetor) {
        await setDoc(doc(db, "Setores", editandoSetor.id), { 
          ...formSetor, 
          ativo: true 
        }, { merge: true });
        alert('Setor atualizado com sucesso!');
      } else {
        const novoId = `setor_${Date.now()}`;
        await setDoc(doc(db, "Setores", novoId), { 
          ...formSetor, 
          ativo: true,
          criadoEm: new Date().toISOString()
        });
        alert('Setor criado com sucesso!');
      }
      
      const snap = await getDocs(collection(db, "Setores"));
      setSetores(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Setor[]);
      
      setShowSetorModal(false);
      setEditandoSetor(null);
      setFormSetor({ nome: '', hospital: '', cnes: '' });
    } catch (error) {
      console.error('Erro ao salvar setor:', error);
      alert('Erro ao salvar setor');
    }
  };

  const excluirSetor = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este setor?')) {
      try {
        await deleteDoc(doc(db, "Setores", id));
        setSetores(setores.filter(s => s.id !== id));
        alert('Setor excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir setor:', error);
        alert('Erro ao excluir setor');
      }
    }
  };

  const abrirEdicaoSetor = (setor: Setor) => {
    setEditandoSetor(setor);
    setFormSetor({
      nome: setor.nome,
      hospital: setor.hospital,
      cnes: setor.cnes || ''
    });
    setShowSetorModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Aluno', 'Matricula', 'Setor', 'Data', 'Entrada', 'Saída', 'Horas', 'Staff Entrada'];
    const rows = filteredRelatorio.map(p => [
      p.aluno_nome,
      p.aluno_matricula,
      p.setor,
      new Date(p.hora_entrada).toLocaleDateString('pt-BR'),
      new Date(p.hora_entrada).toLocaleTimeString('pt-BR'),
      p.hora_saida ? new Date(p.hora_saida).toLocaleTimeString('pt-BR') : '---',
      p.horas_totais || 0,
      p.staff_entrada_nome
    ]);

    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleRefreshEscalas = async () => {
    const snap = await getDocs(collection(db, "Escalas"));
    setEscalasList(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Escala[]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <div>
            <h1 className="text-xl font-bold text-uniceplac-green">Painel do Gestor</h1>
            <p className="text-sm text-zinc-500">{user.nome}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={navigateToDoc}><Book size={18} /></Button>
          <Button variant="outline" onClick={onLogout}><LogOut size={18} /></Button>
        </div>
      </header>

      <div className="flex gap-2 border-b mb-6">
        {['RELATORIO', 'CADASTRO', 'ESCALAS'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t as any)} 
            className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === t ? 'border-uniceplac-green text-uniceplac-green' : 'border-transparent'}`}>
            {t === 'RELATORIO' ? '📊 Relatórios' : t === 'CADASTRO' ? '📝 Cadastros' : '📅 Cronograma'}
          </button>
        ))}
      </div>

      {activeTab === 'RELATORIO' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <p className="text-sm text-zinc-500">Total de Pontos</p>
              <p className="text-2xl font-bold text-uniceplac-green">{stats.totalPontos}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-zinc-500">Total de Horas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalHoras}h</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-zinc-500">Média por Ponto</p>
              <p className="text-2xl font-bold text-amber-600">{stats.mediaHoras}h</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-zinc-500">Alunos Ativos</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.alunosAtivos}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-zinc-500">Plantonês Hoje</p>
              <p className="text-2xl font-bold text-purple-600">{stats.plantoesHoje}</p>
            </Card>
          </div>

          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <input value={filter.aluno} onChange={(e) => setFilter({...filter, aluno: e.target.value})} placeholder="Filtrar aluno" className="p-2 border rounded" />
              <input value={filter.setor} onChange={(e) => setFilter({...filter, setor: e.target.value})} placeholder="Filtrar setor" className="p-2 border rounded" />
            </div>
          </Card>

          <Card className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-3 text-left">Aluno</th>
                  <th className="p-3 text-left">Setor</th>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-left">Entrada</th>
                  <th className="p-3 text-left">Saída</th>
                  <th className="p-3 text-left">Horas</th>
                  <th className="p-3 text-left">Staff</th>
                </tr>
              </thead>
              <tbody>
                {filteredRelatorio.map(p => (
                  <tr key={p.id} className="border-t hover:bg-zinc-50">
                    <td className="p-3">
                      <div className="font-medium">{p.aluno_nome}</div>
                      <div className="text-xs text-zinc-400">{p.aluno_matricula}</div>
                    </td>
                    <td className="p-3">{p.setor}</td>
                    <td className="p-3">{new Date(p.hora_entrada).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3">{new Date(p.hora_entrada).toLocaleTimeString('pt-BR')}</td>
                    <td className="p-3">{p.hora_saida ? new Date(p.hora_saida).toLocaleTimeString('pt-BR') : '---'}</td>
                    <td className="p-3 font-bold text-uniceplac-green">{p.horas_totais || 0}h</td>
                    <td className="p-3">{p.staff_entrada_nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Button onClick={exportToCSV} className="mt-4">
            <Download size={16} className="mr-2" /> Exportar CSV
          </Button>
        </div>
      )}

      {activeTab === 'CADASTRO' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2"><UserPlus size={18}/> Novo Aluno</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.target as HTMLFormElement);
              const d = Object.fromEntries(f);
              await setDoc(doc(db, "Alunos", d.matricula as string), { 
                ...d, carga_horaria_alvo: Number(d.carga_horaria_alvo), horas_concluidas: 0 
              });
              alert("Aluno salvo!");
              (e.target as HTMLFormElement).reset();
              const snap = await getDocs(collection(db, "Alunos"));
              setAlunos(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Aluno[]);
            }} className="space-y-3">
              <input name="nome" placeholder="Nome completo" required className="w-full p-2 border rounded" />
              <input name="matricula" placeholder="Matrícula" required className="w-full p-2 border rounded" />
              <input name="turma" placeholder="Turma" required className="w-full p-2 border rounded" />
              <input name="carga_horaria_alvo" type="number" placeholder="Carga horária alvo" required className="w-full p-2 border rounded" />
              <Button type="submit">Salvar Aluno</Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2"><Users size={18}/> Novo Staff</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.target as HTMLFormElement);
              const d = Object.fromEntries(f);
              await setDoc(doc(db, "Usuarios", d.email as string), { ...d, perfil: 'staff', role: 'STAFF' });
              alert("Staff salvo!");
              (e.target as HTMLFormElement).reset();
              const snap = await getDocs(collection(db, "Usuarios"));
              setStaffList(snap.docs.filter(d => d.data().perfil === 'staff').map(d => ({ id: d.id, ...d.data() })) as Staff[]);
            }} className="space-y-3">
              <input name="nome" placeholder="Nome do professor" required className="w-full p-2 border rounded" />
              <input name="email" type="email" placeholder="Email" required className="w-full p-2 border rounded" />
              <input name="senha" type="password" placeholder="Senha" required className="w-full p-2 border rounded" />
              <Button type="submit">Salvar Staff</Button>
            </form>
          </Card>

          <Card className="p-6 col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold flex items-center gap-2"><MapPin size={18}/> Setores / Especialidades</h2>
              <Button onClick={() => {
                setEditandoSetor(null);
                setFormSetor({ nome: '', hospital: '', cnes: '' });
                setShowSetorModal(true);
              }} size="sm" className="flex items-center gap-1">
                <Plus size={16} /> Novo Setor
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {setores.map(setor => (
                <div key={setor.id} className="border rounded-lg p-3 bg-zinc-50 relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                    <button onClick={() => abrirEdicaoSetor(setor)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => excluirSetor(setor.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h3 className="font-bold text-uniceplac-green">{setor.nome}</h3>
                  <p className="text-sm">{setor.hospital}</p>
                  {setor.cnes && <p className="text-xs text-zinc-400">CNES: {setor.cnes}</p>}
                </div>
              ))}
              {setores.length === 0 && (
                <div className="col-span-3 text-center py-8 text-zinc-400">
                  Nenhum setor cadastrado.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'ESCALAS' && (
        <div className="space-y-8">
          <ImportacaoInteligente onEscalaSalva={handleRefreshEscalas} />
          <VisualizacaoEscalas 
            escalas={escalasList}
            onRefresh={handleRefreshEscalas}
            onDelete={async (id) => {
              await deleteDoc(doc(db, "Escalas", id));
              handleRefreshEscalas();
            }}
          />
        </div>
      )}

      {showSetorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{editandoSetor ? 'Editar Setor' : 'Novo Setor'}</h3>
              <button onClick={() => setShowSetorModal(false)} className="p-1 hover:bg-zinc-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <input
                value={formSetor.nome}
                onChange={(e) => setFormSetor({...formSetor, nome: e.target.value})}
                placeholder="Nome do setor"
                className="w-full p-2 border rounded"
              />
              <input
                value={formSetor.hospital}
                onChange={(e) => setFormSetor({...formSetor, hospital: e.target.value})}
                placeholder="Hospital"
                className="w-full p-2 border rounded"
              />
              <input
                value={formSetor.cnes}
                onChange={(e) => setFormSetor({...formSetor, cnes: e.target.value})}
                placeholder="CNES (opcional)"
                className="w-full p-2 border rounded"
              />
              
              <div className="flex gap-2 mt-4">
                <Button onClick={salvarSetor} className="flex-1">
                  {editandoSetor ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button variant="outline" onClick={() => setShowSetorModal(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STAFF VIEW
// ============================================================================
function StaffView({ user, onLogout, navigateToDoc }: any) {
  const [token, setToken] = useState('');
  const [setores, setSetores] = useState<Setor[]>([]);
  const [setorSelecionado, setSetorSelecionado] = useState<Setor | null>(null);
  const [filtroSetor, setFiltroSetor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarSetores();
  }, []);

  useEffect(() => {
    const gerarToken = () => {
      const novoToken = Math.floor(100000 + Math.random() * 900000).toString();
      setToken(novoToken);
    };
    gerarToken();
    const interval = setInterval(gerarToken, 30000);
    return () => clearInterval(interval);
  }, []);

  const carregarSetores = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "Setores"));
      const setoresData = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Setor[];
      setSetores(setoresData);
      if (setoresData.length > 0 && !setorSelecionado) {
        setSetorSelecionado(setoresData[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
    } finally {
      setLoading(false);
    }
  };

  const setoresFiltrados = setores.filter(s => 
    s.nome.toLowerCase().includes(filtroSetor.toLowerCase()) ||
    s.hospital.toLowerCase().includes(filtroSetor.toLowerCase())
  );

  const qrPayload = setorSelecionado ? JSON.stringify({ 
    staff_id: user.id, 
    setor: setorSelecionado.nome,
    hospital: setorSelecionado.hospital,
    setor_id: setorSelecionado.id,
    token: token,
    timestamp: Date.now()
  }) : '';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <Logo size={32} />
        <div>
          <h1 className="text-xl font-bold text-uniceplac-green">App Staff</h1>
          <p className="text-xs text-zinc-500">{user.nome}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={navigateToDoc} variant="outline" className="p-2"><Book size={18}/></Button>
          <Button onClick={onLogout} variant="outline" className="p-2"><LogOut size={18}/></Button>
        </div>
      </header>

      <Card className="p-6 space-y-6">
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase mb-2 block">
            Buscar Setor
          </label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={filtroSetor}
              onChange={(e) => setFiltroSetor(e.target.value)}
              placeholder="Digite para buscar..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase mb-2 block">
            Selecione seu setor
          </label>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-uniceplac-green" size={24} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {setoresFiltrados.map(setor => (
                <button
                  key={setor.id}
                  onClick={() => setSetorSelecionado(setor)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    setorSelecionado?.id === setor.id
                      ? 'bg-uniceplac-green text-white shadow-md'
                      : 'bg-zinc-50 hover:bg-uniceplac-green/10 border'
                  }`}
                >
                  <div className="font-medium">{setor.nome}</div>
                  <div className={`text-xs ${setorSelecionado?.id === setor.id ? 'text-white/80' : 'text-zinc-400'}`}>
                    {setor.hospital}
                  </div>
                </button>
              ))}
              {setoresFiltrados.length === 0 && (
                <div className="col-span-2 text-center py-4 text-zinc-400">
                  Nenhum setor encontrado
                </div>
              )}
            </div>
          )}
        </div>

        {setorSelecionado && (
          <>
            <div className="border-t pt-4">
              <div className="bg-uniceplac-green/5 p-3 rounded-lg mb-4">
                <p className="text-sm font-medium">Setor selecionado:</p>
                <p className="text-lg font-bold text-uniceplac-green">{setorSelecionado.nome}</p>
                <p className="text-sm text-zinc-500">{setorSelecionado.hospital}</p>
              </div>

              <div className="flex justify-center p-4 bg-white border rounded-2xl">
                <QRCodeSVG value={qrPayload} size={200} level="H" />
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-zinc-500">
                  Token: <span className="font-mono font-bold text-uniceplac-green">{token}</span>
                </p>
                <p className="text-xs text-zinc-400 mt-2">
                  Atualizado a cada 30 segundos
                </p>
              </div>
            </div>

            <button
              onClick={() => setSetorSelecionado(null)}
              className="w-full text-center text-sm text-uniceplac-green hover:underline mt-2"
            >
              ← Trocar de setor
            </button>
          </>
        )}
      </Card>
    </div>
  );
}

// ============================================================================
// STUDENT VIEW (LEGADO - MANTIDO PARA COMPATIBILIDADE)
// ============================================================================
function StudentView({ onBack, studentData, setStudentData }: any) {
  const [step, setStep] = useState(studentData ? 'SCAN' : 'ONBOARDING');
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (step === 'SCAN' && !scanned) {
      scannerRef.current = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scannerRef.current.render(onScanSuccess, () => {});
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [step, scanned]);

  const onScanSuccess = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      handlePonto(data);
      if (scannerRef.current) scannerRef.current.clear();
      setScanned(true);
    } catch (e) {
      alert("QR Code inválido");
    }
  };

  const handlePonto = async (qrData: any) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const isEntrada = new Date().getHours() < 12;
      
      setResult({ 
        message: isEntrada ? 'Entrada registrada com sucesso!' : 'Saída registrada com sucesso!',
        horas_concluidas: isEntrada ? 45 : 51,
        horas_alvo: 120,
        type: isEntrada ? 'entrada' : 'saida'
      });
    } catch (err) {
      setResult({ error: 'Erro de conexão' });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'ONBOARDING') {
    return (
      <div className="max-w-md mx-auto p-6">
        <Logo size={80} className="mx-auto mb-6" />
        <h1 className="text-xl font-bold text-center text-uniceplac-green mb-6">Configurar Aluno</h1>
        <Card className="p-6">
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            const f = new FormData(e.target as any); 
            setStudentData(Object.fromEntries(f)); 
            setStep('SCAN'); 
          }} className="space-y-4">
            <input name="nome" placeholder="Nome completo" required className="w-full p-3 border rounded-xl" />
            <input name="matricula" placeholder="Número da matrícula" required className="w-full p-3 border rounded-xl" />
            <Button type="submit" className="w-full">Começar</Button>
          </form>
        </Card>
        <Button variant="outline" onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center">
        <Logo size={32} />
        <h1 className="text-lg font-bold text-uniceplac-green">Scanner</h1>
        <Button onClick={onBack} variant="outline" className="p-2">Sair</Button>
      </header>
      
      {!scanned ? (
        <div>
          <div id="reader" className="aspect-square bg-zinc-100 rounded-3xl border-4 border-white shadow-xl"></div>
          <p className="text-center text-zinc-500 mt-4">Aponte para o QR Code do Staff</p>
          <p className="text-center text-xs text-zinc-400 mt-2">
            Aluno: {studentData?.nome} ({studentData?.matricula})
          </p>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto text-uniceplac-green" size={48} />
          <p className="mt-4 text-zinc-600">Registrando ponto...</p>
        </div>
      ) : result?.error ? (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <p className="mt-4 text-red-600 font-medium">{result.error}</p>
          <Button onClick={() => setScanned(false)} className="mt-6 w-full">
            Tentar Novamente
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
          <p className="mt-4 text-emerald-600 font-bold text-lg">Ponto Confirmado!</p>
          <p className="text-sm text-zinc-600 mt-2">{result?.message}</p>
          
          <div className="mt-6 p-4 bg-zinc-50 rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Horas cumpridas:</span>
              <span className="font-bold">{result?.horas_concluidas}h</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-zinc-500">Meta total:</span>
              <span className="font-bold">{result?.horas_alvo}h</span>
            </div>
            <div className="w-full bg-zinc-200 h-2 rounded-full mt-3">
              <div 
                className="bg-uniceplac-green h-2 rounded-full" 
                style={{ width: `${(result?.horas_concluidas / result?.horas_alvo) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <Button onClick={() => setScanned(false)} className="mt-6 w-full">
            Novo Registro
          </Button>
        </div>
      )}
    </div>
  );
}