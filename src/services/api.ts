// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  // Staff gera QR Code
  gerarQR: async (staffId: string, setor: string) => {
    const res = await fetch(`${API_URL}/api/qr/gerar/${staffId}/${setor}`);
    if (!res.ok) throw new Error('Erro ao gerar QR Code');
    return res.json();
  },

  // Aluno bate ponto
  baterPonto: async (data: {
    aluno_matricula: string;
    staff_id: string;
    setor: string;
    token_seguranca_qr: string;
    is_sos?: boolean;
  }) => {
    const res = await fetch(`${API_URL}/api/bater-ponto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao bater ponto');
    }
    return res.json();
  },

  // Buscar escalas do aluno
  getEscalasAluno: async (matricula: string) => {
    const res = await fetch(`${API_URL}/api/escalas/${matricula}`);
    return res.json();
  }
};