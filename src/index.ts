import telegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
dotenv.config();
const TOKEN = process.env.TOKEN;
if (!TOKEN) throw new Error("Token not found");

const bot = new telegramBot(TOKEN, { polling: true })

// bot.on("message", (msg) => {
//     bot.sendMessage(msg.chat.id, "Hello World")
// })


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

bot.onText(/\/photo/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendPhoto(chatId, "https://picsum.photos/200/300", {
        caption: "I'm a bot!"
    });
}

);


bot.onText(/\/sticker/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendSticker(chatId, "https://picsum.photos/200/300");
});

bot.onText(/\/location/, (msg) => {
    const chatId = msg.chat.id;



    bot.sendLocation(chatId, 50.4501, 30.5234);
});

bot.onText(/\/venue/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendVenue(chatId, 50.4501, 30.5234, "Tbilisi", "Georgia");
});

bot.onText(/\/contact/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendContact(chatId, "+995 599 99 99 99", "John Doe");
});

bot.onText(/\/dice/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendDice(chatId);
}
);

bot.onText(/\/game/, (msg) => {

    const chatId = msg.chat.id;
    bot.sendGame(chatId, "game");
});

bot.onText(/\/inline/, (msg) => {

    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Inline keyboard", {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Google",
                        url: "https://google.com"
                    }
                ]
            ]
        }
    });
}
);

bot.onText(/\./, (msg) => {
    const chatId: number = msg.chat.id;
    async function get() {
        console.log("Fetching anime");
        console.log(msg);
        bot.sendMessage(chatId, `Hello ${msg.chat.first_name}`, {
            reply_to_message_id: msg.message_id
        });

    }
    get();
});

bot.on("chat_member", (msg) => {

    console.log(msg);
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Hello World")

});
