// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando banco de dados...');

  // 1. Criar Gestor
  const gestor = await prisma.usuario.upsert({
    where: { email: 'admin@medpoint.com' },
    update: {},
    create: {
      email: 'admin@medpoint.com',
      nome: 'Administrador MedPoint',
      senha: 'admin123',
      role: 'GESTOR',
      perfil: 'gestor',
      totp_secret: 'BASE32SECRET123456',
      cnesVinculado: 'TODOS'
    }
  });
  console.log('✅ Gestor criado');

  // 2. Criar Staff
  const staff1 = await prisma.usuario.upsert({
    where: { email: 'maria.silva@medpoint.com' },
    update: {},
    create: {
      email: 'maria.silva@medpoint.com',
      nome: 'Dra. Maria Silva',
      senha: 'staff123',
      role: 'STAFF',
      perfil: 'staff',
      totp_secret: 'BASE32SECRET789012',
      cnesVinculado: '1234567'
    }
  });
  console.log('✅ Staff 1 criado');

  const staff2 = await prisma.usuario.upsert({
    where: { email: 'joao.santos@medpoint.com' },
    update: {},
    create: {
      email: 'joao.santos@medpoint.com',
      nome: 'Dr. João Santos',
      senha: 'staff123',
      role: 'STAFF',
      perfil: 'staff',
      totp_secret: 'BASE32SECRET345678',
      cnesVinculado: '7654321'
    }
  });
  console.log('✅ Staff 2 criado');

  // 3. Criar Alunos
  const aluno1 = await prisma.aluno.upsert({
    where: { matricula: '0016451' },
    update: {},
    create: {
      matricula: '0016451',
      nome: 'João Pedro Santos',
      turma: '11º Período',
      carga_horaria_alvo: 120,
      horas_concluidas: 0,
      status: 'ativo'
    }
  });
  console.log('✅ Aluno 1 criado');

  const aluno2 = await prisma.aluno.upsert({
    where: { matricula: '0016452' },
    update: {},
    create: {
      matricula: '0016452',
      nome: 'Ana Beatriz Oliveira',
      turma: '11º Período',
      carga_horaria_alvo: 120,
      horas_concluidas: 0,
      status: 'ativo'
    }
  });
  console.log('✅ Aluno 2 criado');

  // 4. Criar Setores
  const setor1 = await prisma.setor.create({
    data: {
      nome: 'UTI Neonatal',
      hospital: 'HRAN',
      cnes: '1234567',
      ativo: true
    }
  });
  console.log('✅ Setor 1 criado');

  const setor2 = await prisma.setor.create({
    data: {
      nome: 'Pediatria',
      hospital: 'HRT',
      cnes: '7654321',
      ativo: true
    }
  });
  console.log('✅ Setor 2 criado');

  const setor3 = await prisma.setor.create({
    data: {
      nome: 'Ginecologia',
      hospital: 'HRAN',
      cnes: '1234567',
      ativo: true
    }
  });
  console.log('✅ Setor 3 criado');

  const setor4 = await prisma.setor.create({
    data: {
      nome: 'Clínica Médica',
      hospital: 'HRT',
      cnes: '7654321',
      ativo: true
    }
  });
  console.log('✅ Setor 4 criado');

  // 5. Criar Escalas
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const depoisAmanha = new Date(hoje);
  depoisAmanha.setDate(depoisAmanha.getDate() + 2);

  // Escalas para hoje
  await prisma.escala.create({
    data: {
      aluno_id: aluno1.id,
      aluno_nome: aluno1.nome,
      staff_id: staff1.id,
      staff_nome: staff1.nome,
      setor_id: setor1.id,
      setor_nome: setor1.nome,
      cnes: setor1.cnes,
      hospital: setor1.hospital,
      data: hoje.toISOString().split('T')[0],
      periodo: 'MANHA',
      carga_horaria: 6
    }
  });
  console.log('✅ Escala 1 criada');

  await prisma.escala.create({
    data: {
      aluno_id: aluno2.id,
      aluno_nome: aluno2.nome,
      staff_id: staff2.id,
      staff_nome: staff2.nome,
      setor_id: setor2.id,
      setor_nome: setor2.nome,
      cnes: setor2.cnes,
      hospital: setor2.hospital,
      data: hoje.toISOString().split('T')[0],
      periodo: 'TARDE',
      carga_horaria: 6
    }
  });
  console.log('✅ Escala 2 criada');

  // Escalas para amanhã
  await prisma.escala.create({
    data: {
      aluno_id: aluno1.id,
      aluno_nome: aluno1.nome,
      staff_id: staff2.id,
      staff_nome: staff2.nome,
      setor_id: setor3.id,
      setor_nome: setor3.nome,
      cnes: setor3.cnes,
      hospital: setor3.hospital,
      data: amanha.toISOString().split('T')[0],
      periodo: 'MANHA',
      carga_horaria: 6
    }
  });
  console.log('✅ Escala 3 criada');

  await prisma.escala.create({
    data: {
      aluno_id: aluno2.id,
      aluno_nome: aluno2.nome,
      staff_id: staff1.id,
      staff_nome: staff1.nome,
      setor_id: setor4.id,
      setor_nome: setor4.nome,
      cnes: setor4.cnes,
      hospital: setor4.hospital,
      data: amanha.toISOString().split('T')[0],
      periodo: 'TARDE',
      carga_horaria: 6
    }
  });
  console.log('✅ Escala 4 criada');

  console.log('\n🎉 BANCO DE DADOS POPULADO COM SUCESSO!');
  console.log('========================================');
  console.log('📊 RESUMO:');
  console.log(`- Gestor: admin@medpoint.com / admin123`);
  console.log(`- Staff 1: maria.silva@medpoint.com / staff123`);
  console.log(`- Staff 2: joao.santos@medpoint.com / staff123`);
  console.log(`- Alunos: ${aluno1.nome} (${aluno1.matricula}) e ${aluno2.nome} (${aluno2.matricula})`);
  console.log(`- Setores: 4 setores criados`);
  console.log(`- Escalas: 4 escalas criadas`);
  console.log('========================================');
}

main()
  .catch(e => {
    console.error('❌ ERRO:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });