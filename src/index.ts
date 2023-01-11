import telegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import { exec } from "child_process"
import fs from "fs"
import { Waifu } from "./typings/types"
import https from "https"
import http from "http"
import { testAPI } from "./ai.js"
dotenv.config();
var count: number = 0;
const TOKEN = process.env.TOKEN;
if (!TOKEN) throw new Error("Token not found");
if (!process.env.ADMIN) throw new Error("Admin not found");
const bot = new telegramBot(TOKEN, { polling: true })
// //////////////////////////////////////////////////////////
bot.onText(/^\/start$/, (msg: telegramBot.Message) => {
    bot.sendMessage(msg.chat.id, "Hello World")
})

bot.on("message", (msg: telegramBot.Message) => {
    const admin: number = Number(process.env.ADMIN);
    const chatId: number = msg.chat.id;
    const greetings: string[] = ['hi', 'hlo', 'Hello', 'HLO', 'Hi', 'Hii', 'hello'];
    if (!msg.text) return;
    if (greetings.includes(msg.text)) {
        if (msg.from?.id === admin) {
            bot.sendMessage(chatId, "Hello Boss", {
                reply_to_message_id: msg.message_id
            })
        } else
            bot.sendMessage(chatId, `Hello ${msg.chat.first_name} @${msg.chat.username}`);

    }

})


bot.onText(/\/echo (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
    const chatId: number = msg.chat.id;
    if (!match) return;
    const resp: string = match[1];
    bot.sendMessage(chatId, resp);
})


bot.onText(/\/anime/, (msg: telegramBot.Message) => {
    getWaifu("https://api.waifu.im/search/?is_nsfw=false", msg);
})

bot.onText(/\/nsfw/, (msg: telegramBot.Message) => {
    getWaifu("https://api.waifu.im/search/?is_nsfw=true", msg);
});



bot.onText(/\/compile/, (msg: telegramBot.Message) => {
    const chatId: number = msg.chat.id;
    if (msg.from?.id !== Number(process.env.ADMIN)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return
    };
    if (!msg.reply_to_message) {
        bot.sendMessage(chatId, "Reply to a message with /compile");
        return;
    }
    bot.sendMessage(chatId, "Compiling...", {
        reply_to_message_id: msg.reply_to_message.message_id
    }).then((msg: telegramBot.Message) => {
        const message_id = msg.message_id;
        const code: string | undefined = msg.reply_to_message?.text;
        if (!code) return;
        const file: string = "main.cpp";
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
            if (stdout.length === 0) {
                bot.sendMessage(chatId, "done", {
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
bot.onText(/\/exec (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
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
/////////////////////////
bot.onText(/\/runRedwalls/, (msg: telegramBot.Message) => {
    if (msg.from?.id !== Number(process.env.ADMIN)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return
    };
    bot.sendMessage(msg.chat.id, "Running Redwalls").then(() => {
        exec("/exec pm2 stop redwalls &&  cd /var/www/redwalls/  && git pull && yarn build && pm2 restart redwalls ", (err, stdout, stderr) => {
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
    });
})

//////////////////

async function getWaifu(link: string, msg: telegramBot.Message) {
    const chatId: number = msg.chat.id;
    try {
        const response: Response = await fetch(link);
        const data: Waifu = await response.json();
        const url: string = data.images[0].preview_url;
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
        }).catch(() => {
            bot.sendPhoto(chatId, data.images[0].url, {
                reply_to_message_id: msg.message_id,
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "Download",
                            url: data.images[0].url

                        }]]
                }
            }).catch((err) => {
                bot.sendMessage(chatId, `Error: ${err.message} \n Don't worry, Here is a link to the image \n ${data.images[0].url}`);
            });
        });
    } catch (error) {
        bot.sendMessage(chatId, "Error");
    }
}

bot.on("photo", (msg: telegramBot.Message) => {
    if (msg.from?.id !== Number(process.env.ADMIN)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    if (msg.photo) {
        const photo: telegramBot.PhotoSize = msg.photo[msg.photo.length - 1];
        const fileId: string = photo.file_id;
        bot.getFile(fileId).then((file: telegramBot.File) => {
            const url: string = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path}`;
            const file_name: string = file.file_path?.split("/").pop() as string;
            const file_path: string = `./uploads/${file_name}`;
            const fileStream: fs.WriteStream = fs.createWriteStream
                (file_path);

            https.get(url, (response) => {
                response.pipe(fileStream);
                fileStream.on("finish", () => {
                    fileStream.close();

                });
            }
            );

        });
    }
});


bot.onText(/\/download (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
    if (msg.from?.id !== Number(process.env.ADMIN)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    if (!match) {
        bot.sendMessage(msg.chat.id, "Please provide a link");
        return;
    }
    const link: string = match[1].split("/").pop() as string;
    console.log(link);
    const chatId: number = msg.chat.id;
    const message_id: number = msg.message_id;
    bot.sendMessage(chatId, "Downloading", {
        reply_to_message_id: message_id
    }).then(() => {
        const stream = fs.createReadStream('./uploads/' + link);
        bot.sendDocument(chatId, stream).catch((err) => {
            console.log(err.message);
            bot.sendMessage(chatId, err.message);
        });
    })
});

bot.onText(/\/downloadAll/, (msg: telegramBot.Message) => {
    const chatId: number = msg.chat.id;
    const message_id: number = msg.message_id;
    if (msg.from?.id !== Number(process.env.ADMIN)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    var files = fs.readdirSync('./uploads');
    bot.sendMessage(chatId, "Downloading", {
        reply_to_message_id: message_id
    }).then(() => {
        files.forEach((file) => {
            const stream = fs.createReadStream('./uploads/' + file);
            bot.sendDocument(chatId, stream).catch((err) => {
                console.log(err.message);
                bot.sendMessage(chatId, err.message);
            });
        });
    })
});

bot.on("polling_error", (msg) => {
    ++count;
    if (count == 5) {
        bot.close();
    }
    bot.sendMessage(msg.message, `Polling error ${count}`).catch((err) => { });

})


// console.log("Bot started");
// testAPI();
// bot.on("message", (msg) => {
//     const chatid: number = msg.chat.id;
//     bot.sendMessage(chatid, "Hello").then((msg) => {
//         setTimeout(() => {
//             bot.editMessageText("How are you", {
//                 chat_id: chatid, message_id: msg.message_id
//             });

//         }, 3000);
//     })
// })
// const server = http.createServer((req, res) => {
//     const str = fs.createReadStream('./uploads/file_3.jpg');
//     str.pipe(res);
// });
// const port = process.env.PORT || 3000;
// server.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// }
// );