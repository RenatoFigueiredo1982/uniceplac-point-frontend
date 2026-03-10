// src/components/EscalasSimplificado.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Card, Button } from '../App';
import { Calendar, Clock, Users, MapPin, Trash2, Save, X } from 'lucide-react';

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
}

interface Staff {
  id: string;
  nome: string;
  email: string;
}

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
}

interface Props {
  alunos: Aluno[];
  staffs: Staff[];
  onEscalaSalva?: () => void;
}

export const EscalasSimplificado: React.FC<Props> = ({ alunos, staffs, onEscalaSalva }) => {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [novaEscala, setNovaEscala] = useState({
    aluno_id: '',
    staff_id: '',
    setor: '',
    hospital: '',
    data: new Date().toISOString().split('T')[0],
    periodo: 'MANHA',
    carga_horaria: 6
  });

  useEffect(() => {
    carregarEscalas();
  }, []);

  const carregarEscalas = async () => {
    const snap = await getDocs(collection(db, "Escalas"));
    setEscalas(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Escala[]);
  };

  const salvarEscala = async () => {
    const aluno = alunos.find(a => a.id === novaEscala.aluno_id);
    const staff = staffs.find(s => s.id === novaEscala.staff_id);

    if (!aluno || !staff) {
      alert('Selecione aluno e staff');
      return;
    }

    const id = `${aluno.matricula}_${novaEscala.data}_${novaEscala.periodo}`;
    
    await setDoc(doc(db, "Escalas", id), {
      aluno_nome: aluno.nome,
      aluno_matricula: aluno.matricula,
      staff_nome: staff.nome,
      staff_email: staff.email,
      setor: novaEscala.setor,
      hospital: novaEscala.hospital,
      data: novaEscala.data,
      periodo: novaEscala.periodo,
      carga_horaria: novaEscala.carga_horaria,
      dataCadastro: new Date().toISOString()
    });

    carregarEscalas();
    if (onEscalaSalva) onEscalaSalva();
  };

  const excluirEscala = async (id: string) => {
    if (confirm('Excluir esta escala?')) {
      await deleteDoc(doc(db, "Escalas", id));
      carregarEscalas();
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário rápida de escala */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Nova Escala</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={novaEscala.aluno_id}
            onChange={(e) => setNovaEscala({...novaEscala, aluno_id: e.target.value})}
            className="p-2 border rounded-lg text-sm"
          >
            <option value="">Selecione aluno</option>
            {alunos.map(a => (
              <option key={a.id} value={a.id}>{a.nome} - {a.matricula}</option>
            ))}
          </select>

          <select
            value={novaEscala.staff_id}
            onChange={(e) => setNovaEscala({...novaEscala, staff_id: e.target.value})}
            className="p-2 border rounded-lg text-sm"
          >
            <option value="">Selecione staff</option>
            {staffs.map(s => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>

          <input
            value={novaEscala.setor}
            onChange={(e) => setNovaEscala({...novaEscala, setor: e.target.value})}
            placeholder="Setor"
            className="p-2 border rounded-lg text-sm"
          />

          <input
            value={novaEscala.hospital}
            onChange={(e) => setNovaEscala({...novaEscala, hospital: e.target.value})}
            placeholder="Hospital"
            className="p-2 border rounded-lg text-sm"
          />

          <input
            type="date"
            value={novaEscala.data}
            onChange={(e) => setNovaEscala({...novaEscala, data: e.target.value})}
            className="p-2 border rounded-lg text-sm"
          />

          <select
            value={novaEscala.periodo}
            onChange={(e) => setNovaEscala({...novaEscala, periodo: e.target.value})}
            className="p-2 border rounded-lg text-sm"
          >
            <option value="MANHA">Manhã</option>
            <option value="TARDE">Tarde</option>
            <option value="NOITE">Noite</option>
          </select>

          <input
            type="number"
            value={novaEscala.carga_horaria}
            onChange={(e) => setNovaEscala({...novaEscala, carga_horaria: parseFloat(e.target.value)})}
            placeholder="Carga horária"
            className="p-2 border rounded-lg text-sm"
            step="0.5"
          />

          <Button onClick={salvarEscala} className="w-full">
            <Save size={16} className="mr-2" /> Adicionar
          </Button>
        </div>
      </Card>

      {/* Lista de escalas */}
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <th className="p-3 text-left">Aluno</th>
                <th className="p-3 text-left">Staff</th>
                <th className="p-3 text-left">Local</th>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Período</th>
                <th className="p-3 text-left">Carga</th>
                <th className="p-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {escalas.map(escala => (
                <tr key={escala.id} className="border-t hover:bg-zinc-50">
                  <td className="p-3">
                    <div className="font-medium">{escala.aluno_nome}</div>
                    <div className="text-xs text-zinc-400">{escala.aluno_matricula}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{escala.staff_nome}</div>
                    <div className="text-xs text-zinc-400">{escala.staff_email}</div>
                  </td>
                  <td className="p-3">
                    <div>{escala.setor}</div>
                    <div className="text-xs text-zinc-400">{escala.hospital}</div>
                  </td>
                  <td className="p-3">{new Date(escala.data).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${escala.periodo === 'MANHA' ? 'bg-amber-100 text-amber-700' : 
                        escala.periodo === 'TARDE' ? 'bg-blue-100 text-blue-700' : 
                        'bg-purple-100 text-purple-700'}`}>
                      {escala.periodo}
                    </span>
                  </td>
                  <td className="p-3 font-bold">{escala.carga_horaria}h</td>
                  <td className="p-3">
                    <button
                      onClick={() => excluirEscala(escala.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};