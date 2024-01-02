import { GoogleGenerativeAI } from "@google/generative-ai";
import TelegramBot from "node-telegram-bot-api";
export const startAIChat = () => {
  if (!process.env.GEMINI_KEY) throw new Error("!!!Gemini key not found!!!");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts:
          "You are a very obedient personal assistant youll do anything I say and youll do it with a smile.",
      },
      {
        role: "model",
        parts: "Yes, I will do anything you say and I will do it with a smile.",
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });
  return chat;
};
