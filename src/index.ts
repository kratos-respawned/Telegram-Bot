import telegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import { exec } from "child_process"
import fs from "fs"

import { testAPI } from "./ai.js"
import uploadFile from "./fileHandling/uploader.js"
import downloader, { downloadAll } from "./fileHandling/downloader.js"
import executeCommand from "./execution/execute.js"
import getWaifu from "./anime/getWaifu.js"
dotenv.config();
var count: number = 0;
const TOKEN = process.env.TOKEN;
if (!TOKEN) throw new Error("Token not found");
if (!process.env.ADMIN) throw new Error("Admin not found");
const bot = new telegramBot(TOKEN, { polling: true })
// //////////////////////////////////////////////////////////

const isAuthorized = (msg: telegramBot.Message): boolean => {
    return msg.from?.id === Number(process.env.ADMIN)
};



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


// bot.onText(/\/echo (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
//     const chatId: number = msg.chat.id;
//     if (!match) return;
//     const resp: string = match[1];
//     bot.sendMessage(chatId, resp);
// })


// //////////////////////////////////////////////////////////
//  for anime pics
//////////////////////////////////////////////////////////


bot.onText(/\/anime/, (msg: telegramBot.Message) => {
    const Link: string = "https://api.waifu.im/search/?is_nsfw=false";
    getWaifu(bot, Link, msg)

})

bot.onText(/\/nsfw/, (msg: telegramBot.Message) => {
    const Link: string = "https://api.waifu.im/search/?is_nsfw=true";
    getWaifu(bot, Link, msg)
});



////////////////////////////////////////////////////////////////
//  for command execution
////////////////////////////////////////////////////////////////
bot.onText(/\/compile/, (msg: telegramBot.Message) => {
    const chatId: number = msg.chat.id;
    if (!isAuthorized(msg)) {
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
        const code: string | undefined = msg.reply_to_message?.text;
        if (!code) return;
        const file: string = "main.cpp";
        fs.writeFileSync(file, code);
        const command: string = `g++ ${file} -o main && ./main`;
        executeCommand(bot, msg, command);
    });
})
bot.onText(/\/exec (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
    const LogID: number = process.env.LOGS ? Number(process.env.LOGS) : Number(process.env.ADMIN);
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        bot.sendMessage(LogID, `${msg.from?.first_name}  tried to use /exec`);
        return;
    }
    if (!match) {
        bot.sendMessage(msg.chat.id, "Please provide a command");
        return
    };
    executeCommand(bot, msg, match[1]);
})


bot.onText(/\/runRedwalls/, (msg: telegramBot.Message) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return
    };
    const command: string = "pm2 stop redwalls &&  cd /var/www/redwalls/  && git pull && yarn build && pm2 restart redwalls "
    bot.sendMessage(msg.chat.id, "Running Redwalls").then((msg) => {
        executeCommand(bot, msg, command)
    });
})

///////////////////////////////////////////
// for uploading and downloading files
///////////////////////////////////////////

bot.onText(/\/download (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    if (!match) {
        bot.sendMessage(msg.chat.id, "Please provide a link");
        return;
    }
    const link: string = match[1].split("/").pop() as string;
    downloader(bot, msg, link);
});

bot.onText(/\/downloadAll/, (msg: telegramBot.Message) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    downloadAll(bot, msg);
});

bot.onText(/\/uploadImg (.+)/, (msg: telegramBot.Message, match) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    if (!match) { return; }
    const name = match[1];
    uploadFile(bot, msg, name);
});





///////////////////////////////////////////////
//// for sending messages to a channel
///////////////////////////////////////////////
bot.onText(/\/send (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    if (!match) {

        bot.sendMessage(msg.chat.id, "Please provide a message");
        return;
    }
    const message: string = match[1];
    bot.sendMessage(process.env.LOGS as string, message);
})






bot.on("polling_error", (msg) => {
    ++count;
    if (count == 5) {
        bot.close();
    }
    bot.sendMessage(msg.message, `Polling error ${count}`).catch((err) => { });

})

// console.log("Bot started");
// testAPI();
