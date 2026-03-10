// src/components/VisualizacaoEscalas.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button } from '../App';
import { 
  Calendar, Clock, Users, MapPin, Mail, Hash,
  ChevronDown, ChevronUp, Filter, RefreshCw,
  Download, Trash2, Edit, Save, X
} from 'lucide-react';

interface Escala {
  id: string;
  aluno_nome: string;
  aluno_matricula: string;
  staff_nome: string;
  staff_email: string;
  setor: string;
  hospital: string;
  data: string;
  periodo: string;
  carga_horaria: number;
  status?: 'pendente' | 'confirmada' | 'concluida';
}

interface VisualizacaoEscalasProps {
  escalas: Escala[];
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (escala: Escala) => void;
}

export const VisualizacaoEscalas: React.FC<VisualizacaoEscalasProps> = ({ 
  escalas, 
  onRefresh,
  onDelete,
  onEdit 
}) => {
  const [filtro, setFiltro] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [ordenarPor, setOrdenarPor] = useState<'data' | 'aluno' | 'setor'>('data');
  const [ordenarDirecao, setOrdenarDirecao] = useState<'asc' | 'desc'>('asc');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [escalaEditando, setEscalaEditando] = useState<Partial<Escala>>({});

  // Filtrar escalas
  const escalasFiltradas = escalas.filter(escala => {
    const matchGeral = !filtro || 
      escala.aluno_nome.toLowerCase().includes(filtro.toLowerCase()) ||
      escala.aluno_matricula.includes(filtro) ||
      escala.staff_nome.toLowerCase().includes(filtro.toLowerCase()) ||
      escala.setor.toLowerCase().includes(filtro.toLowerCase());
    
    const matchData = !filtroData || escala.data === filtroData;
    const matchPeriodo = !filtroPeriodo || escala.periodo === filtroPeriodo;
    
    return matchGeral && matchData && matchPeriodo;
  });

  // Ordenar escalas
  const escalasOrdenadas = [...escalasFiltradas].sort((a, b) => {
    let comparacao = 0;
    switch (ordenarPor) {
      case 'data':
        comparacao = a.data.localeCompare(b.data);
        break;
      case 'aluno':
        comparacao = a.aluno_nome.localeCompare(b.aluno_nome);
        break;
      case 'setor':
        comparacao = a.setor.localeCompare(b.setor);
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
      {/* Barra de Ferramentas */}
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
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-1" />
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Estatísticas */}
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

      {/* Tabela de Escalas - Estilo Prisma */}
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
                      // Modo Edição
                      <>
                        <td className="px-4 py-2">
                          <input
                            value={escalaEditando.aluno_nome || ''}
                            onChange={(e) => setEscalaEditando({...escalaEditando, aluno_nome: e.target.value})}
                            className="w-full p-1 border rounded text-sm"
                          />
                          <input
                            value={escalaEditando.aluno_matricula || ''}
                            onChange={(e) => setEscalaEditando({...escalaEditando, aluno_matricula: e.target.value})}
                            className="w-full p-1 border rounded text-sm mt-1"
                            placeholder="Matrícula"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={escalaEditando.staff_nome || ''}
                            onChange={(e) => setEscalaEditando({...escalaEditando, staff_nome: e.target.value})}
                            className="w-full p-1 border rounded text-sm"
                          />
                          <input
                            value={escalaEditando.staff_email || ''}
                            onChange={(e) => setEscalaEditando({...escalaEditando, staff_email: e.target.value})}
                            className="w-full p-1 border rounded text-sm mt-1"
                            placeholder="Email"
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
                      // Modo Visualização
                      <>
                        <td className="px-4 py-3">
                          <div className="font-medium">{escala.aluno_nome}</div>
                          <div className="text-xs text-zinc-400">{escala.aluno_matricula}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{escala.staff_nome}</div>
                          <div className="text-xs text-zinc-400">{escala.staff_email}</div>
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
        
        {/* Rodapé da tabela */}
        <div className="px-4 py-3 bg-zinc-50 border-t flex items-center justify-between text-xs text-zinc-500">
          <div>
            Exibindo {escalasOrdenadas.length} de {escalas.length} escalas
          </div>
          <div className="flex gap-4">
            <button className="hover:text-uniceplac-green">Anterior</button>
            <button className="hover:text-uniceplac-green">Próxima</button>
          </div>
        </div>
      </Card>

      {/* Cards de Visualização Alternativa (Mobile/Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
        {escalasOrdenadas.map((escala) => (
          <Card key={escala.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-uniceplac-green">{escala.aluno_nome}</h3>
                <p className="text-xs text-zinc-400">{escala.aluno_matricula}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium
                ${escala.periodo === 'MANHA' ? 'bg-amber-100 text-amber-700' : 
                  escala.periodo === 'TARDE' ? 'bg-blue-100 text-blue-700' : 
                  'bg-purple-100 text-purple-700'}`}>
                {escala.periodo}
              </span>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-zinc-400" />
                <span>{escala.staff_nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-zinc-400" />
                <span>{escala.setor} - {escala.hospital}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-zinc-400" />
                <span>{new Date(escala.data).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-zinc-400" />
                <span>{escala.carga_horaria}h</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t">
              <button
                onClick={() => iniciarEdicao(escala)}
                className="p-1 text-zinc-500 hover:text-uniceplac-green"
              >
                <Edit size={16} />
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(escala.id)}
                  className="p-1 text-zinc-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};