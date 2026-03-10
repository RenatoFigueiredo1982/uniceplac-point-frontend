// routes/escalas.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Rota para importar múltiplas escalas
router.post('/importar', async (req, res) => {
  try {
    const { escalas } = req.body;
    
    if (!escalas || !Array.isArray(escalas)) {
      return res.status(400).json({ error: 'Formato inválido. Envie um array de escalas.' });
    }

    const resultados = [];
    const erros = [];

    for (const escala of escalas) {
      try {
        // Buscar IDs do aluno e staff
        const aluno = await prisma.aluno.findUnique({
          where: { matricula: escala.matricula }
        });

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
            cnes: escala.cnes || '',
            hospital: escala.hospital || '',
            setor: escala.setor,
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
    console.error('Erro ao importar escalas:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rota para listar escalas
router.get('/listar', async (req, res) => {
  try {
    const escalas = await prisma.escala.findMany({
      include: {
        aluno: true,
        staff: true
      },
      orderBy: {
        data: 'asc'
      }
    });
    res.json(escalas);
  } catch (error) {
    console.error('Erro ao listar escalas:', error);
    res.status(500).json({ error: 'Erro ao buscar escalas' });
  }
});

// Rota para escalas por data
router.get('/data/:data', async (req, res) => {
  try {
    const { data } = req.params;
    const escalas = await prisma.escala.findMany({
      where: { data },
      include: {
        aluno: true,
        staff: true
      }
    });
    res.json(escalas);
  } catch (error) {
    console.error('Erro ao buscar escalas:', error);
    res.status(500).json({ error: 'Erro ao buscar escalas' });
  }
});

module.exports = router;