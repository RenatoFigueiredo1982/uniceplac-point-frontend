const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { differenceInMinutes, startOfDay, endOfDay } = require('date-fns');

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// ============================================================================
// ROTA DE SAÚDE (para teste)
// ============================================================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ROTAS DE SETORES
// ============================================================================

// GET /api/setores/listar - Listar todos os setores
app.get('/api/setores/listar', async (req, res) => {
  try {
    // Usando Prisma (ajuste conforme seu banco)
    const setores = await prisma.setor.findMany({
      where: { ativo: true }
    });
    res.json(setores);
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    res.status(500).json({ error: 'Erro ao buscar setores' });
  }
});

// POST /api/setores - Criar novo setor
app.post('/api/setores', async (req, res) => {
  try {
    const { nome, hospital, cnes } = req.body;
    
    const novoSetor = await prisma.setor.create({
      data: {
        nome,
        hospital,
        cnes,
        ativo: true
      }
    });
    
    res.json({ success: true, setor: novoSetor });
  } catch (error) {
    console.error('Erro ao criar setor:', error);
    res.status(500).json({ error: 'Erro ao criar setor' });
  }
});

// ============================================================================
// ROTAS DE ALUNOS
// ============================================================================

// GET /api/alunos/listar - Listar todos os alunos
app.get('/api/alunos/listar', async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany();
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// POST /api/alunos - Cadastrar novo aluno
app.post('/api/alunos', async (req, res) => {
  try {
    const { nome, matricula, turma, carga_horaria_alvo } = req.body;
    
    const novoAluno = await prisma.aluno.create({
      data: {
        nome,
        matricula,
        turma,
        carga_horaria_alvo: Number(carga_horaria_alvo) || 120,
        horas_concluidas: 0,
        status: 'ativo'
      }
    });
    
    res.json({ success: true, aluno: novoAluno });
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    res.status(500).json({ error: 'Erro ao cadastrar aluno' });
  }
});

// ============================================================================
// ROTAS DE STAFF
// ============================================================================

// GET /api/staff/listar - Listar todos os staff
app.get('/api/staff/listar', async (req, res) => {
  try {
    const staff = await prisma.usuario.findMany({
      where: { role: 'STAFF' }
    });
    res.json(staff);
  } catch (error) {
    console.error('Erro ao buscar staff:', error);
    res.status(500).json({ error: 'Erro ao buscar staff' });
  }
});

// POST /api/staff - Cadastrar novo staff
app.post('/api/staff', async (req, res) => {
  try {
    const { nome, email, senha, cnesVinculado } = req.body;
    
    const novoStaff = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha,
        role: 'STAFF',
        perfil: 'staff',
        cnesVinculado: cnesVinculado || '',
        totp_secret: Math.random().toString(36).substring(2, 15)
      }
    });
    
    res.json({ success: true, staff: novoStaff });
  } catch (error) {
    console.error('Erro ao cadastrar staff:', error);
    res.status(500).json({ error: 'Erro ao cadastrar staff' });
  }
});

// ============================================================================
// ROTAS DE QR CODE
// ============================================================================

// GET /api/qr/gerar/:staffId/:setor - Gerar QR Code
app.get('/api/qr/gerar/:staffId/:setor', (req, res) => {
  try {
    const { staffId, setor } = req.params;
    
    // Gerar token de 6 dígitos
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    
    const payload = JSON.stringify({
      staff_id: staffId,
      setor: setor,
      token: token,
      timestamp: Date.now()
    });
    
    res.json({ payload });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    res.status(500).json({ error: 'Erro ao gerar QR Code' });
  }
});

// ============================================================================
// ROTAS DE PONTO
// ============================================================================

// POST /api/bater-ponto - Registrar entrada/saída
app.post('/api/bater-ponto', async (req, res) => {
  try {
    const { aluno_matricula, staff_id, setor, token_seguranca_qr, is_sos } = req.body;
    
    // Buscar aluno
    const aluno = await prisma.aluno.findUnique({
      where: { matricula: aluno_matricula }
    });
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    // Buscar ponto aberto hoje
    const hoje = new Date();
    const inicio = new Date(hoje.setHours(0, 0, 0, 0));
    const fim = new Date(hoje.setHours(23, 59, 59, 999));
    
    const pontoAberto = await prisma.ponto.findFirst({
      where: {
        aluno_id: aluno.id,
        hora_saida: null,
        data_plantao: {
          gte: inicio,
          lte: fim
        }
      }
    });
    
    if (!pontoAberto) {
      // Registrar ENTRADA
      const novoPonto = await prisma.ponto.create({
        data: {
          aluno_id: aluno.id,
          setor: setor,
          data_plantao: new Date(),
          hora_entrada: new Date(),
          staff_entrada_id: staff_id,
          is_sos_entrada: is_sos || false
        }
      });
      
      res.json({ 
        message: 'Entrada registrada com sucesso!',
        tipo: 'ENTRADA',
        ponto: novoPonto
      });
    } else {
      // Registrar SAÍDA
      const agora = new Date();
      const minutos = differenceInMinutes(agora, pontoAberto.hora_entrada);
      const horas = Math.round((minutos / 60) * 10) / 10;
      
      const pontoAtualizado = await prisma.ponto.update({
        where: { id: pontoAberto.id },
        data: {
          hora_saida: agora,
          horas_totais: horas,
          staff_saida_id: staff_id,
          is_sos_saida: is_sos || false
        }
      });
      
      // Atualizar horas do aluno
      await prisma.aluno.update({
        where: { id: aluno.id },
        data: {
          horas_concluidas: {
            increment: horas
          }
        }
      });
      
      res.json({ 
        message: `Saída registrada! Total: ${horas} horas`,
        tipo: 'SAIDA',
        horas: horas,
        ponto: pontoAtualizado
      });
    }
  } catch (error) {
    console.error('Erro ao registrar ponto:', error);
    res.status(500).json({ error: 'Erro ao registrar ponto' });
  }
});

// ============================================================================
// ROTAS DE ESCALAS
// ============================================================================

// POST /api/escalas/importar - Importar escalas
app.post('/api/escalas/importar', async (req, res) => {
  try {
    const { escalas } = req.body;
    
    const resultados = [];
    
    for (const escala of escalas) {
      const novaEscala = await prisma.escala.create({
        data: {
          aluno_id: escala.matricula,
          aluno_nome: escala.aluno_nome || 'Aluno',
          staff_id: escala.email_staff,
          staff_nome: escala.staff_nome || 'Staff',
          setor: escala.setor,
          hospital: escala.hospital || '',
          data: escala.data,
          periodo: escala.periodo,
          carga_horaria: escala.carga_horaria || 6
        }
      });
      resultados.push(novaEscala);
    }
    
    res.json({ 
      success: true, 
      message: `${resultados.length} escalas importadas`,
      resultados 
    });
  } catch (error) {
    console.error('Erro ao importar escalas:', error);
    res.status(500).json({ error: 'Erro ao importar escalas' });
  }
});

// GET /api/escalas/listar - Listar escalas
app.get('/api/escalas/listar', async (req, res) => {
  try {
    const escalas = await prisma.escala.findMany({
      orderBy: { data: 'asc' }
    });
    res.json(escalas);
  } catch (error) {
    console.error('Erro ao listar escalas:', error);
    res.status(500).json({ error: 'Erro ao listar escalas' });
  }
});

// ============================================================================
// ROTAS DE RELATÓRIOS
// ============================================================================

// GET /api/relatorios - Relatórios com filtros
app.get('/api/relatorios', async (req, res) => {
  try {
    const { aluno, setor, dataInicio, dataFim } = req.query;
    
    // Construir filtros
    const filtros = {};
    
    if (aluno) {
      filtros.aluno_nome = { contains: aluno };
    }
    if (setor) {
      filtros.setor = setor;
    }
    if (dataInicio && dataFim) {
      filtros.data_plantao = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      };
    }
    
    const pontos = await prisma.ponto.findMany({
      where: filtros,
      include: {
        aluno: true,
        staff_entrada: true,
        staff_saida: true
      },
      orderBy: { hora_entrada: 'desc' }
    });
    
    res.json(pontos);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📡 Rotas disponíveis:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/setores/listar`);
  console.log(`   - POST /api/setores`);
  console.log(`   - GET  /api/alunos/listar`);
  console.log(`   - POST /api/alunos`);
  console.log(`   - GET  /api/staff/listar`);
  console.log(`   - POST /api/staff`);
  console.log(`   - GET  /api/qr/gerar/:staffId/:setor`);
  console.log(`   - POST /api/bater-ponto`);
  console.log(`   - POST /api/escalas/importar`);
  console.log(`   - GET  /api/escalas/listar`);
  console.log(`   - GET  /api/relatorios`);
});