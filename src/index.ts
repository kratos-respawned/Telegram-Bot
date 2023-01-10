import telegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
dotenv.config();
const TOKEN = process.env.TOKEN;
if (!TOKEN) throw new Error("Token not found");

const bot = new telegramBot(TOKEN, { polling: true })
// chatbotapi
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Hello World")
})

bot.onText(/\/echo (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    if (!match) return;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
})

bot.onText(/\/dice/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendDice(chatId);
}
);

// "&is_nsfw=false"

bot.onText(/\/anime/, (msg) => {
    const chatId = msg.chat.id;
    async function getWaifu() {
        const response = await fetch("https://api.waifu.im/search/?is_nsfw=false");
        const data = await response.json();
        console.log(data.images[0].url);
        const url = data.images[0].preview_url;
        try {
            bot.sendPhoto(chatId, url, {
                reply_to_message_id: msg.message_id,
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "Download",
                            url: data.images[0].url
                        }
                    ]
                    ]
                }
            });
        } catch (e) {
            bot.sendMessage(chatId, "Error");
        }
    }
    getWaifu();
})




bot.on("message", (msg) => {
    const admin = Number(process.env.ADMIN);
    const chatId: number = msg.chat.id;
    const greetings = ['hi', 'hlo', 'Hello', 'HLO', 'Hi', 'Hii', 'hello'];
    if (!msg.text) return;
    if (greetings.includes(msg.text)) {
        if (msg.from?.id === admin) {
            bot.sendMessage(msg.chat.id, "Hello Boss", {
                reply_to_message_id: msg.message_id
            })
        } else
            bot.sendMessage(chatId, `Hello ${msg.chat.first_name} @${msg.chat.username}`);

    }

})

