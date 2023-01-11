import TelegramBot from "node-telegram-bot-api";
import { Configuration, OpenAIApi } from "openai";
var openai: OpenAIApi;


export async function startAI() {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
    const config = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG
    });
    openai = new OpenAIApi(config);
}

export const AiResponse = async (text: string, risk: number): Promise<string> => {
    if (!openai) throw new Error("OpenAI not initialized");
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        max_tokens: 50,
        temperature: risk,
    });
    if (!response.data.choices[0].text)
        return "error";
    return response.data.choices[0].text;
}
export const AiImage = async (text: string, risk: number) => {
    if (!openai) throw new Error("OpenAI not initialized");

}
export const botResponse = (bot: TelegramBot, msg: TelegramBot.Message, message: string, risk: number) => {
    const chatId: number = msg.chat.id;
    bot.sendMessage(chatId, "Thinking...").then((msg) => {
        const response = AiResponse(message, risk);
        response.then((res) => {
            bot.editMessageText(res, {
                chat_id: chatId,
                message_id: msg.message_id
            })
        });
    });
}