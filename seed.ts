import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore";

// COLE AQUI AS CHAVES QUE ESTÃO NO SEU .env
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inicializar() {
  console.log("🚀 Populando Firestore...");
  try {
    // Criar Aluno
    await setDoc(doc(db, "Alunos", "0016451"), {
      nome: "Renato Figueiredo",
      matricula: "0016451",
      dataCadastro: new Date().toISOString(),
      status: "ativo",
      carga_horaria_alvo: 120,
      horas_concluidas: 0
    });

    // Criar Gestor
    await setDoc(doc(db, "Usuarios", "admin@medpoint.com"), {
      nome: "Renato Figueiredo",
      email: "admin@medpoint.com",
      perfil: "gestor"
    });

    console.log("✅ Banco configurado com sucesso!");
    process.exit(0);
  } catch (e) {
    console.error("❌ Erro:", e);
    process.exit(1);
  }
}

inicializar();