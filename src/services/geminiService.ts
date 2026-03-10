// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ParsedSchedule {
  matricula: string;
  email_staff: string;
  cnes: string;
  setor: string;
  data: string;
  periodo: string;
  carga_horaria: number;
}

// ✅ APENAS UMA DECLARAÇÃO - use o nome que preferir (text ou textoEscala)
export const parseScheduleWithAI = async (text: string): Promise<ParsedSchedule[]> => {
  // Por enquanto, retorna um array vazio para não quebrar o app
  // Em produção, você implementaria a chamada real à API do Gemini
  console.log("Recebido texto para processar:", text);
  
  try {
    // Aqui você implementaria a lógica real com a API do Gemini
    // Exemplo:
    // const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // const result = await model.generateContent(`Extraia os dados de escala: ${text}`);
    // const response = await result.response;
    // const parsedText = response.text();
    // ... processar resposta
    
    // Simulação de processamento
    return [
      {
        matricula: "0016451",
        email_staff: "maria.silva@medpoint.com",
        cnes: "1234567",
        setor: "UTI",
        data: new Date().toISOString().split('T')[0],
        periodo: "MANHA",
        carga_horaria: 6
      }
    ];
  } catch (error) {
    console.error("Erro ao processar com IA:", error);
    return []; // Retorna array vazio em caso de erro
  }
};