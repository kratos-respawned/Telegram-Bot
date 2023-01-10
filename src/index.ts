import telegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import { exec } from "child_process"
import fs from "fs"
dotenv.config();
const TOKEN = process.env.TOKEN;
if (!TOKEN) throw new Error("Token not found");
if (!process.env.ADMIN) throw new Error("Admin not found");
const bot = new telegramBot(TOKEN, { polling: true })
// chatbotapi
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Hello World")
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



bot.onText(/\/anime/, (msg) => {
    getWaifu("https://api.waifu.im/search/?is_nsfw=false", msg);
})

bot.onText(/\/nsfw/, (msg) => {
    getWaifu("https://api.waifu.im/search/?is_nsfw=true", msg);
});



bot.onText(/\/compile/, (msg) => {
    const chatId = msg.chat.id;
    if (!msg.reply_to_message) {
        bot.sendMessage(chatId, "Reply to a message with /compile");
        return;
    }
    bot.sendMessage(chatId, "Compiling...", {
        reply_to_message_id: msg.reply_to_message.message_id
    }).then((msg) => {
        const message_id = msg.message_id;
        const code = msg.reply_to_message?.text;
        if (!code) return;
        const file = "main.cpp";
        fs.writeFileSync(file, code);
        exec(`g++ ${file} -o main && ./main`, (err, stdout, stderr) => {
            if (err) {
                bot.sendMessage(chatId, err.message, {
                    reply_to_message_id: message_id
                });
                return;
            }
            if (stderr) {
                bot.sendMessage(chatId, "Error", {
                    reply_to_message_id: message_id
                });
                return;
            }
            bot.sendMessage(chatId, stdout, {
                reply_to_message_id: message_id
            });
        }
        );

    });
})
bot.onText(/\/exec (.+)/, (msg, match) => {
    const LogID: number = process.env.LOGS ? Number(process.env.LOGS) : Number(process.env.ADMIN);
    if (msg.from?.id !== Number(process.env.ADMIN)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        bot.sendMessage(LogID, `${msg.from?.first_name}  tried to use /exec`);
        return;
    }
    if (!match) {
        bot.sendMessage(msg.chat.id, "Please provide a command");
        return
    };

    // if (match[1].match(/rm \-rf/)) {
    //     bot.sendMessage(msg.chat.id, "You are not authorized to use this command \nThis incident will be reported");
    //     bot.sendMessage(LogID, `${msg.from?.first_name}  tried to delete files`);
    //     return;
    // }


    // if (match[1].match(/sudo/)) {
    //     bot.sendMessage(msg.chat.id, "You are not authorized to use this command \nThis incident will be reported");
    //     bot.sendMessage(LogID, `${msg.from?.first_name}  tried to delete files`);
    // }
    exec(match[1], (err, stdout, stderr) => {
        if (err) {
            bot.sendMessage(msg.chat.id, err.message);
            return;
        }
        if (stderr) {
            bot.sendMessage(msg.chat.id, stderr);
            return;
        }

        if (stdout.length === 0) { bot.sendMessage(msg.chat.id, "done"); return }
        bot.sendMessage(msg.chat.id, stdout);
    })
})
bot.onText(/\/runRedwalls/, (msg) => {
    if (msg.from?.id !== Number(process.env.ADMIN)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return
    };
    exec("cd .. && ls ", (err, stdout, stderr) => {
        if (err) {
            bot.sendMessage(msg.chat.id, err.message);
            return;
        }
        if (stderr) {
            bot.sendMessage(msg.chat.id, stderr);
            return;
        }
        bot.sendMessage(msg.chat.id, stdout);
    });
})

//////////////////

async function getWaifu(link: string, msg: telegramBot.Message) {
    const chatId = msg.chat.id;
    try {
        const response = await fetch(link);
        const data = await response.json();

        const url = data.images[0].preview_url;

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
        }).catch((err) => {
            bot.sendPhoto(chatId, data.images[0].url, {
                reply_to_message_id: msg.message_id,
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "Download",
                            url: data.images[0].url

                        }]]
                }
            })
        });
    } catch (error) {
        bot.sendMessage(chatId, "Error");
    }
}