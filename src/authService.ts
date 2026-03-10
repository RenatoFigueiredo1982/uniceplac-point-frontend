import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./db";

// Função para fazer o login
export const fazerLogin = async (email: string, senha: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    console.log("Login efetuado com sucesso!", userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error("Erro na autenticação:", error.code);
    throw new Error("E-mail ou senha incorretos. Tente novamente.");
  }
};

// Função para sair do sistema
export const fazerLogout = async () => {
  try {
    await signOut(auth);
    console.log("Usuário deslogado.");
  } catch (error) {
    console.error("Erro ao sair:", error);
  }
};