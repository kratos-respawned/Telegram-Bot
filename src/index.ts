import telegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
dotenv.config();
const TOKEN = process.env.TOKEN;
if (!TOKEN) throw new Error("Token not found");
const bot = new telegramBot(TOKEN, { polling: true })
bot.onText(/\/start/, (msg) => {

    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome to my bot");
})
bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!match) return bot.sendMessage(chatId, "No text found");
    console.log("asda");
    const resp = match[1];
    bot.sendMessage(chatId, resp);
})
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "This is a help message");
}
);

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(msg.text);
    bot.sendMessage(chatId, "I don't understand you");
    bot.sendPhoto(chatId, "https://i.imgur.com/3ZQ3X2I.jpg", {
        caption: "I'm a bot!"
    });
})


