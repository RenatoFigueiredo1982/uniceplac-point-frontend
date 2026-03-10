const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simularAplicativos() {
    console.log("🔍 Buscando dados no banco local...");
    
    const staff = await prisma.usuario.findFirst({ where: { role: 'STAFF' } });
    const aluno = await prisma.aluno.findFirst();

    if (!staff || !aluno) {
        console.log("❌ Erro: Cadastre o Staff e o Aluno no Prisma Studio primeiro!");
        return;
    }

    console.log(`👨‍⚕️ Staff logado: ${staff.nome}`);
    console.log(`👨‍🎓 Aluno lendo o QR: ${aluno.nome}`);

    // SIMULAÇÃO 1: App do Staff CHAMA O SERVIDOR para pegar o QR Code
    console.log("📱 App do Staff pedindo o QR Code para o Servidor...");
    
    // Bate na Rota 1 do nosso server.js
    const resQr = await fetch(`http://localhost:3000/api/qr/gerar/${staff.id}/UTI_Neonatal`);
    
    if (!resQr.ok) {
        console.log("❌ Ocorreu um erro na API. O servidor (server.js) está rodando na outra aba?");
        return;
    }

    const dadosQr = await resQr.json();
    
    // Extrai o token do JSON que o servidor devolveu
    const payloadDecodificado = JSON.parse(dadosQr.payload);
    const tokenGerado = payloadDecodificado.token;
    
    console.log(`✅ O Servidor autorizou e gerou o token: ${tokenGerado}`);
    console.log("📸 App do Aluno enviando leitura para o servidor...\n");

    // SIMULAÇÃO 2: App do Aluno faz o POST (Bater o Ponto)
    // Bate na Rota 2 do nosso server.js
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