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
        model: "text-curie-001",
        prompt: text,
        max_tokens: 100,
        temperature: risk,
    });
    if (!response.data.choices[0].text)
        return "error";
    return response.data.choices[0].text;
}
export const AiImage = async (bot: TelegramBot, msg: TelegramBot.Message, text: string) => {
    if (!openai) throw new Error("OpenAI not initialized");

    // if (await flagged(text)) {
    //     bot.sendMessage(msg.chat.id, "Your message was flagged as inappropriate");
    //     return;
    // }
    openai.createImage({
        prompt: text,
        response_format: "url",
        size: "512x512",

    }).then((resp) => {
        const Data = resp.data.data;
        Data.forEach((element) => {
            if (!element.url) {
                bot.sendMessage(msg.chat.id, "Error");
                return;
            }
            bot.sendPhoto(msg.chat.id, element.url).catch((err) => {
                bot.sendMessage(msg.chat.id, "Error sending image \n here is the link: " + element.url);
            });
            bot.sendPhoto(Number(process.env.LOGS), element.url).catch((err) => {
                bot.sendMessage(Number(process.env.LOGS), "Error sending image \n here is the link: " + element.url);
            });
        });
    }).catch((err) => {
        bot.sendMessage(msg.chat.id, err.message);
    })

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

const flagged = async (message: string): Promise<boolean> => {
    const resp = await openai.createModeration({
        input: message,
    });
    return resp.data.results[0].flagged
} 