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
export const AiImage = async (bot: TelegramBot, msg: TelegramBot.Message, text: string) => {
    if (!openai) throw new Error("OpenAI not initialized");
    const data = {
        prompt: text,
        n: 1,
    }
    const response = await openai.createImage(data)
    if (!response) {
        bot.sendMessage(msg.chat.id, "Error");
        return;
    }
    const url: string | undefined = response.data.data[response.data.data.length].url;
    if (!url) return;
    bot.sendPhoto(msg.chat.id, url).catch((err) => {
        bot.sendMessage(msg.chat.id, "Error sending image \n here is the link: " + url);
    });
    bot.sendPhoto(Number(process.env.LOGS), url).catch((err) => {
        bot.sendMessage(Number(process.env.LOGS), "Error sending image \n here is the link: " + url);
    });
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