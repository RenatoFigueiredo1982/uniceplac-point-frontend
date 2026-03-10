const fetch = require('node-fetch');

async function testar() {
  try {
    console.log('Testando conexão com backend...');
    const res = await fetch('http://localhost:3000/api/health');
    const data = await res.json();
    console.log('✅ Backend OK:', data);
  } catch (error) {
    console.error('❌ Backend não está respondendo:', error.message);
    console.log('Certifique-se de que o backend está rodando em: http://localhost:3000');
  }
}

testar();