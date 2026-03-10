import { collection, doc, setDoc, addDoc, getDocs, updateDoc, query, where } from "firebase/firestore";
import { db } from "./db"; // Importa a conexão que configuramos no db.ts

// ============================================================================
// 1. COLEÇÃO: ALUNOS (Gestão de Internos)
// ============================================================================

export const salvarAluno = async (matricula: string, nome: string) => {
  try {
    // Usamos setDoc no lugar de addDoc para forçar que o ID do documento seja a matrícula.
    // Isso blinda o sistema contra cadastros duplicados do mesmo aluno.
    const alunoRef = doc(db, "Alunos", matricula);
    await setDoc(alunoRef, {
      nome,
      matricula,
      dataCadastro: new Date().toISOString(),
      status: "ativo"
    });
    console.log(`Aluno ${nome} cadastrado com sucesso!`);
    return true;
  } catch (error) {
    console.error("Erro ao salvar aluno no Firebase:", error);
    throw error;
  }
};

export const listarAlunos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Alunos"));
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return [];
  }
};

// ============================================================================
// 2. COLEÇÃO: PONTOS (A Máquina de Estado do Check-in/Check-out)
// ============================================================================

export const registrarCheckIn = async (matriculaAluno: string, staffEmail: string, cnesHospital: string, isSos: boolean = false) => {
  try {
    const pontosRef = collection(db, "Pontos");
    const novoPonto = await addDoc(pontosRef, {
      matriculaAluno,
      staffEmail,
      cnesHospital,
      horaEntrada: new Date().toISOString(),
      horaSaida: null,
      status: "aberto", // Flag de controle de estado
      isSos // Identifica se foi batido via QR Code (false) ou Ponto Manual/SOS (true)
    });
    return novoPonto.id; // Retorna o Hash único do ponto gerado pelo Google
  } catch (error) {
    console.error("Erro ao registrar check-in:", error);
    throw error;
  }
};

export const registrarCheckOut = async (idPonto: string) => {
  try {
    const pontoRef = doc(db, "Pontos", idPonto);
    await updateDoc(pontoRef, {
      horaSaida: new Date().toISOString(),
      status: "fechado"
    });
    return true;
  } catch (error) {
    console.error("Erro ao fechar o ponto:", error);
    throw error;
  }
};

// ============================================================================
// 3. COLEÇÃO: USUÁRIOS (Gestores e Staff)
// ============================================================================

export const criarUsuarioStaff = async (email: string, nome: string, perfil: "gestor" | "staff", cnesVinculado?: string) => {
  try {
    const userRef = doc(db, "Usuarios", email);
    await setDoc(userRef, {
      nome,
      email,
      perfil,
      cnesVinculado: cnesVinculado || "TODOS",
      dataCriacao: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Erro ao criar staff:", error);
    throw error;
  }
};