const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando normalmente' });
});

// Rota para importar escalas (simplificada)
app.post('/api/escalas/importar', async (req, res) => {
  try {
    const { escalas } = req.body;
    
    if (!escalas || !Array.isArray(escalas)) {
      return res.status(400).json({ error: 'Formato inválido. Envie um array de escalas.' });
    }

    const resultados = [];
    const erros = [];

    for (const escala of escalas) {
      try {
        // Verificar se aluno existe
        const aluno = await prisma.aluno.findUnique({
          where: { matricula: escala.matricula }
        });

        // Verificar se staff existe
        const staff = await prisma.usuario.findUnique({
          where: { email: escala.email_staff }
        });

        if (!aluno) {
          erros.push(`Aluno não encontrado: ${escala.matricula}`);
          continue;
        }

        if (!staff) {
          erros.push(`Staff não encontrado: ${escala.email_staff}`);
          continue;
        }

        // Criar escala
        const novaEscala = await prisma.escala.create({
          data: {
            aluno_id: aluno.id,
            aluno_nome: aluno.nome,
            staff_id: staff.id,
            staff_nome: staff.nome,
            setor: escala.setor,
            hospital: escala.hospital || '',
            data: escala.data,
            periodo: escala.periodo,
            carga_horaria: escala.carga_horaria || 6
          }
        });

        resultados.push(novaEscala);
      } catch (error) {
        erros.push(`Erro ao processar escala: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `${resultados.length} escalas importadas com sucesso`,
      resultados,
      erros: erros.length > 0 ? erros : undefined
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para listar escalas
app.get('/api/escalas/listar', async (req, res) => {
  try {
    const escalas = await prisma.escala.findMany();
    res.json(escalas);
  } catch (error) {
    console.error('Erro ao listar escalas:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Rotas disponíveis:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/escalas/importar`);
  console.log(`   - GET  /api/escalas/listar`);
});