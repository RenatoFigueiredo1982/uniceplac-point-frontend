const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Resetando banco de dados...');
  
  // 1. Limpar tudo
  console.log('🧹 Limpando tabelas...');
  await prisma.ponto.deleteMany();
  await prisma.escala.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.usuario.deleteMany();
  
  // 2. Criar Gestor
  console.log('👤 Criando gestor...');
  const gestor = await prisma.usuario.create({
    data: {
      email: 'admin@medpoint.com',
      nome: 'Administrador MedPoint',
      senha: 'admin123',
      role: 'GESTOR',
      perfil: 'gestor',
      cnesVinculado: 'TODOS',
      totp_secret: 'BASE32SECRET123456'
    }
  });
  
  // 3. Criar Staffs
  console.log('👥 Criando staffs...');
  const staff1 = await prisma.usuario.create({
    data: {
      email: 'maria.silva@medpoint.com',
      nome: 'Dra. Maria Silva',
      senha: 'staff123',
      role: 'STAFF',
      perfil: 'staff',
      cnesVinculado: '1234567',
      totp_secret: 'BASE32SECRET789012'
    }
  });
  
  const staff2 = await prisma.usuario.create({
    data: {
      email: 'joao.santos@medpoint.com',
      nome: 'Dr. João Santos',
      senha: 'staff123',
      role: 'STAFF',
      perfil: 'staff',
      cnesVinculado: '7654321',
      totp_secret: 'BASE32SECRET345678'
    }
  });
  
  // 4. Criar Aluno
  console.log('🎓 Criando aluno...');
  const aluno = await prisma.aluno.create({
    data: {
      matricula: '0016451',
      nome: 'João Pedro Santos',
      turma: '11º Período',
      carga_horaria_alvo: 120,
      horas_concluidas: 0,
      status: 'ativo'
    }
  });
  
  // 5. Criar Escalas
  console.log('📅 Criando escalas...');
  await prisma.escala.create({
    data: {
      aluno_id: aluno.id,
      aluno_nome: aluno.nome,
      staff_id: staff1.id,
      staff_nome: staff1.nome,
      cnes: '1234567',
      hospital: 'HRAN',
      setor: 'UTI Neonatal',
      data: '2026-03-10',
      periodo: 'MANHA',
      carga_horaria: 6
    }
  });
  
  await prisma.escala.create({
    data: {
      aluno_id: aluno.id,
      aluno_nome: aluno.nome,
      staff_id: staff2.id,
      staff_nome: staff2.nome,
      cnes: '7654321',
      hospital: 'HRT',
      setor: 'Pediatria',
      data: '2026-03-11',
      periodo: 'TARDE',
      carga_horaria: 6
    }
  });
  
  console.log('✅ Banco resetado com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`- Gestor: admin@medpoint.com / admin123`);
  console.log(`- Staff 1: maria.silva@medpoint.com / staff123`);
  console.log(`- Staff 2: joao.santos@medpoint.com / staff123`);
  console.log(`- Aluno: ${aluno.nome} (${aluno.matricula})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());