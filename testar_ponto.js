const { PrismaClient } = require('@prisma/client');
const { authenticator } = require('otplib');
const prisma = new PrismaClient();

async function simularAplicativos() {
    console.log("🔍 Buscando dados no banco local...");
    
    // Pega o primeiro staff e o primeiro aluno que você cadastrou no Prisma Studio
    const staff = await prisma.usuario.findFirst({ where: { role: 'STAFF' } });
    const aluno = await prisma.aluno.findFirst();

    if (!staff || !aluno) {
        console.log("❌ Erro: Cadastre o Staff e o Aluno no Prisma Studio primeiro!");
        return;
    }

    console.log(`👨‍⚕️ Staff logado: ${staff.nome}`);
    console.log(`👨‍🎓 Aluno lendo o QR: ${aluno.nome}`);

    // SIMULAÇÃO 1: App do Staff gera o token invisível do QR Code
    const tokenGerado = authenticator.generate(staff.totp_secret);
    console.log(`📱 App do Staff gerou o token: ${tokenGerado}`);

    // SIMULAÇÃO 2: App do Aluno faz o POST para a nossa API
    console.log("📸 Enviando leitura para o servidor...\n");

    const resposta = await fetch('http://localhost:3000/api/bater-ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            aluno_matricula: aluno.matricula,
            staff_id: staff.id,
            setor: 'UTI_Neonatal',
            token_seguranca_qr: tokenGerado,
            is_sos: false
        })
    });

    const dados = await resposta.json();
    console.log("==== 🟢 RESPOSTA DA API ====");
    console.log(dados);
    console.log("============================\n");
}

simularAplicativos();