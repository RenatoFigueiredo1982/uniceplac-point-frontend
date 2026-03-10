import React, { useState } from 'react';
import { 
  Book, 
  Shield, 
  Users, 
  Zap, 
  Smartphone, 
  Database, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  Globe,
  Cpu,
  Layout,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';

const sections = [
  {
    id: 'intro',
    title: 'Introdução',
    icon: <Book size={20} />,
    content: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-uniceplac-green">Visão Geral do Sistema</h2>
        <p className="text-zinc-600 leading-relaxed">
          O <strong>UNICEPLAC - POINT</strong> (Proof of Presence & Internato Tracking) é uma solução de última geração projetada para automatizar e auditar a presença de alunos de medicina em cenários de internato hospitalar.
        </p>
        <p className="text-zinc-600 leading-relaxed">
          O sistema resolve o desafio crítico de garantir que o aluno esteja fisicamente presente no hospital durante o horário escalado, utilizando tecnologias de <strong>Geofencing</strong> (Cerca Geográfica) e <strong>Tokens Dinâmicos</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-uniceplac-mint/10 rounded-xl border border-uniceplac-mint/20">
            <h3 className="font-bold text-uniceplac-green mb-1">Auditabilidade</h3>
            <p className="text-xs text-zinc-500">Registros imutáveis com prova de localização e validação por preceptor.</p>
          </div>
          <div className="p-4 bg-uniceplac-mint/10 rounded-xl border border-uniceplac-mint/20">
            <h3 className="font-bold text-uniceplac-green mb-1">Eficiência</h3>
            <p className="text-xs text-zinc-500">Redução de 90% no trabalho manual de conferência de folhas de ponto.</p>
          </div>
          <div className="p-4 bg-uniceplac-mint/10 rounded-xl border border-uniceplac-mint/20">
            <h3 className="font-bold text-uniceplac-green mb-1">Inteligência</h3>
            <p className="text-xs text-zinc-500">Importação de escalas complexas via IA (Google Gemini).</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'arch',
    title: 'Arquitetura Técnica',
    icon: <Cpu size={20} />,
    content: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-uniceplac-green">Stack Tecnológica e Segurança</h2>
        <p className="text-zinc-600">Construído com as tecnologias mais robustas do mercado para garantir alta disponibilidade e segurança de dados.</p>
        
        <div className="space-y-6 mt-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <Layout className="text-uniceplac-green" size={20} />
            </div>
            <div>
              <h4 className="font-bold">Frontend Moderno</h4>
              <p className="text-sm text-zinc-500">Interface reativa desenvolvida em <strong>React 18</strong> com <strong>TypeScript</strong>, garantindo tipagem estrita e menos erros em tempo de execução. Estilização via <strong>Tailwind CSS</strong> para performance otimizada.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <Database className="text-uniceplac-green" size={20} />
            </div>
            <div>
              <h4 className="font-bold">Backend Escalável</h4>
              <p className="text-sm text-zinc-500">Servidor <strong>Node.js</strong> com arquitetura baseada em eventos. Gerenciamento de estado em tempo real para sincronização de tokens entre Staff e Aluno.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <Zap className="text-uniceplac-green" size={20} />
            </div>
            <div>
              <h4 className="font-bold">Inteligência Artificial</h4>
              <p className="text-sm text-zinc-500">Integração nativa com <strong>Google Gemini API</strong> para processamento de linguagem natural, permitindo a leitura de escalas em texto livre.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Funcionalidades por Perfil',
    icon: <Users size={20} />,
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-uniceplac-green">Ecossistema de Usuários</h2>
        
        <div className="space-y-8">
          <section className="border-l-4 border-uniceplac-green pl-6 py-2">
            <h3 className="text-lg font-bold mb-2">1. Perfil Gestor (Administração)</h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-uniceplac-green" /> Dashboard consolidado de presença em tempo real.</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-uniceplac-green" /> Gestão de alunos, turmas e carga horária alvo.</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-uniceplac-green" /> <strong>Importação Inteligente:</strong> Conversão de escalas de texto para banco de dados via IA.</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-uniceplac-green" /> Exportação de relatórios em conformidade com exigências acadêmicas (CSV/Excel).</li>
            </ul>
          </section>

          <section className="border-l-4 border-uniceplac-mint pl-6 py-2">
            <h3 className="text-lg font-bold mb-2">2. Perfil Staff (Preceptor)</h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-uniceplac-mint" /> Geração de <strong>Tokens Dinâmicos</strong> (QR Codes) que expiram a cada 15 segundos.</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-uniceplac-mint" /> Registro de SOS: Entrada/Saída manual para casos excepcionais (ex: falha de bateria do aluno).</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-uniceplac-mint" /> Seleção de setor e hospital de atuação.</li>
            </ul>
          </section>

          <section className="border-l-4 border-zinc-300 pl-6 py-2">
            <h3 className="text-lg font-bold mb-2">3. Perfil Aluno (Interno)</h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-zinc-400" /> Validação de <strong>Geofencing</strong>: O ponto só é liberado se o aluno estiver no hospital.</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-zinc-400" /> Leitura de QR Code para prova de proximidade com o preceptor.</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-zinc-400" /> Acompanhamento em tempo real do progresso da carga horária.</li>
            </ul>
          </section>
        </div>
      </div>
    )
  },
  {
    id: 'security',
    title: 'Segurança e Fraude',
    icon: <Shield size={20} />,
    content: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-uniceplac-green">Mecanismos Anti-Fraude</h2>
        <p className="text-zinc-600">O sistema foi desenhado para mitigar tentativas de registros falsos:</p>
        
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="flex items-start gap-4 p-4 bg-white border border-zinc-100 rounded-xl">
            <div className="p-2 bg-red-50 rounded-lg"><Lock className="text-red-500" size={20} /></div>
            <div>
              <h4 className="font-bold">Tokens Efêmeros</h4>
              <p className="text-sm text-zinc-500">O QR Code gerado pelo Staff muda constantemente. Fotos de QR Codes antigos não funcionam, exigindo presença física no momento exato.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white border border-zinc-100 rounded-xl">
            <div className="p-2 bg-blue-50 rounded-lg"><Globe className="text-blue-500" size={20} /></div>
            <div>
              <h4 className="font-bold">Cerca Geográfica (Geofencing)</h4>
              <p className="text-sm text-zinc-500">Utilizamos a API de Geolocalização do navegador para validar as coordenadas do aluno contra o perímetro cadastrado do hospital (CNES).</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white border border-zinc-100 rounded-xl">
            <div className="p-2 bg-amber-50 rounded-lg"><Shield size={20} className="text-amber-500" /></div>
            <div>
              <h4 className="font-bold">Logs de Auditoria</h4>
              <p className="text-sm text-zinc-500">Cada registro armazena quem validou a entrada e a saída, permitindo rastrear discrepâncias em registros manuais (SOS).</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export const Documentation = ({ onBack }: { onBack: () => void }) => {
  const [activeSection, setActiveSection] = useState('intro');

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 border-r border-zinc-100 p-6 flex flex-col gap-8 bg-zinc-50/30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-600" />
          </button>
          <h1 className="font-bold text-xl text-uniceplac-green">Documentação</h1>
        </div>

        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeSection === section.id 
                ? 'bg-uniceplac-green text-white shadow-md shadow-uniceplac-green/20' 
                : 'text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              {section.icon}
              {section.title}
              {activeSection === section.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-uniceplac-green/5 rounded-2xl border border-uniceplac-green/10">
          <p className="text-[10px] font-bold text-uniceplac-green uppercase tracking-wider mb-1">Suporte Técnico</p>
          <p className="text-xs text-zinc-500">Para dúvidas técnicas ou integração via API, contate o setor de TI do UNICEPLAC.</p>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-4xl">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {sections.find(s => s.id === activeSection)?.content}
        </motion.div>
      </main>
    </div>
  );
};
