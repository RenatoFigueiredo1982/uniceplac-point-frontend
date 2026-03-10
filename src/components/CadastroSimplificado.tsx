// src/components/CadastroSimplificado.tsx
import React, { useState } from 'react';
import { db } from '../db';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { Card, Button } from '../App';
import { UserPlus, Users, Save, Trash2, Edit, X, CheckCircle } from 'lucide-react';

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  turma: string;
}

interface Staff {
  id: string;
  nome: string;
  email: string;
  hospital?: string;
}

interface Props {
  alunos: Aluno[];
  staffs: Staff[];
  onAlunoSalvo?: () => void;
  onStaffSalvo?: () => void;
}

export const CadastroSimplificado: React.FC<Props> = ({ 
  alunos, 
  staffs, 
  onAlunoSalvo, 
  onStaffSalvo 
}) => {
  const [novoAluno, setNovoAluno] = useState({ nome: '', matricula: '', turma: '' });
  const [novoStaff, setNovoStaff] = useState({ nome: '', email: '', hospital: '' });
  const [editandoAluno, setEditandoAluno] = useState<string | null>(null);
  const [editandoStaff, setEditandoStaff] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState('');

  const salvarAluno = async () => {
    if (!novoAluno.nome || !novoAluno.matricula) {
      setMensagem('Nome e matrícula são obrigatórios');
      return;
    }

    try {
      await setDoc(doc(db, "Alunos", novoAluno.matricula), {
        nome: novoAluno.nome,
        matricula: novoAluno.matricula,
        turma: novoAluno.turma || 'Não informada',
        dataCadastro: new Date().toISOString()
      });

      setNovoAluno({ nome: '', matricula: '', turma: '' });
      setMensagem('✅ Aluno cadastrado!');
      if (onAlunoSalvo) onAlunoSalvo();
    } catch (error) {
      setMensagem('❌ Erro ao cadastrar');
    }
  };

  const salvarStaff = async () => {
    if (!novoStaff.nome || !novoStaff.email) {
      setMensagem('Nome e email são obrigatórios');
      return;
    }

    try {
      await setDoc(doc(db, "Usuarios", novoStaff.email), {
        nome: novoStaff.nome,
        email: novoStaff.email,
        hospital: novoStaff.hospital || '',
        perfil: 'staff',
        role: 'STAFF',
        dataCadastro: new Date().toISOString()
      });

      setNovoStaff({ nome: '', email: '', hospital: '' });
      setMensagem('✅ Staff cadastrado!');
      if (onStaffSalvo) onStaffSalvo();
    } catch (error) {
      setMensagem('❌ Erro ao cadastrar');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Card de Alunos */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={20} className="text-uniceplac-green" />
          <h2 className="text-lg font-bold">Cadastro de Alunos</h2>
        </div>

        {/* Formulário rápido */}
        <div className="space-y-3 mb-6">
          <input
            value={novoAluno.nome}
            onChange={(e) => setNovoAluno({...novoAluno, nome: e.target.value})}
            placeholder="Nome do aluno"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <input
              value={novoAluno.matricula}
              onChange={(e) => setNovoAluno({...novoAluno, matricula: e.target.value})}
              placeholder="Matrícula"
              className="flex-1 p-2 border rounded-lg text-sm"
            />
            <input
              value={novoAluno.turma}
              onChange={(e) => setNovoAluno({...novoAluno, turma: e.target.value})}
              placeholder="Turma"
              className="flex-1 p-2 border rounded-lg text-sm"
            />
          </div>
          <Button onClick={salvarAluno} className="w-full">
            <Save size={16} className="mr-2" /> Salvar Aluno
          </Button>
        </div>

        {/* Lista de alunos cadastrados */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {alunos.map(aluno => (
            <div key={aluno.id} className="bg-uniceplac-green/5 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{aluno.nome}</p>
                <p className="text-xs text-zinc-500">{aluno.matricula} • {aluno.turma}</p>
              </div>
              <button className="p-1 text-zinc-400 hover:text-uniceplac-green">
                <Edit size={14} />
              </button>
            </div>
          ))}
          {alunos.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-4">Nenhum aluno cadastrado</p>
          )}
        </div>
      </Card>

      {/* Card de Staff */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-uniceplac-green" />
          <h2 className="text-lg font-bold">Cadastro de Staff</h2>
        </div>

        {/* Formulário rápido */}
        <div className="space-y-3 mb-6">
          <input
            value={novoStaff.nome}
            onChange={(e) => setNovoStaff({...novoStaff, nome: e.target.value})}
            placeholder="Nome do professor"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <input
            value={novoStaff.email}
            onChange={(e) => setNovoStaff({...novoStaff, email: e.target.value})}
            placeholder="Email"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <input
            value={novoStaff.hospital}
            onChange={(e) => setNovoStaff({...novoStaff, hospital: e.target.value})}
            placeholder="Hospital (opcional)"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <Button onClick={salvarStaff} className="w-full">
            <Save size={16} className="mr-2" /> Salvar Staff
          </Button>
        </div>

        {/* Lista de staff cadastrados */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {staffs.map(staff => (
            <div key={staff.id} className="bg-uniceplac-green/5 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{staff.nome}</p>
                <p className="text-xs text-zinc-500">{staff.email} • {staff.hospital || 'Sem hospital'}</p>
              </div>
              <button className="p-1 text-zinc-400 hover:text-uniceplac-green">
                <Edit size={14} />
              </button>
            </div>
          ))}
          {staffs.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-4">Nenhum staff cadastrado</p>
          )}
        </div>
      </Card>

      {/* Mensagem flutuante */}
      {mensagem && (
        <div className="fixed bottom-4 right-4 bg-uniceplac-green text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle size={18} />
          {mensagem}
        </div>
      )}
    </div>
  );
};