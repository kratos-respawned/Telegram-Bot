import telegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import fs from "fs"

////////////////////////////////////////////////////////////////// 
// modules
////////////////////////////////////////////////////////////////// 
import { AiImage, botResponse, startAI } from "./ai.js"
import uploadFile from "./fileHandling/uploader.js"
import downloader, { downloadAll } from "./fileHandling/downloader.js"
import executeCommand from "./execution/execute.js"
import getWaifu from "./anime/getWaifu.js"
// //////////////////////////////////////////////////////////


dotenv.config();
startAI();
var count: number = 0;
const TOKEN = process.env.TOKEN;
if (!TOKEN) throw new Error("Token not found");
if (!process.env.ADMIN) throw new Error("Admin not found");
const bot = new telegramBot(TOKEN, { polling: true })
////////////////////////////////////////////////////////////

const isAuthorized = (msg: telegramBot.Message): boolean => {
    return msg.from?.id === Number(process.env.ADMIN)
};

////////////////////////////////////////////////////////////


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
    const path: string = "./uploads/";
    downloader(bot, msg, link, path);
});

bot.onText(/\/downloadAll/, (msg: telegramBot.Message) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    const path: string = "./uploads/";
    downloadAll(bot, msg, path);
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

bot.onText(/^downloadAll$/, (msg: telegramBot.Message) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    const path: string = "./images/";
    downloadAll(bot, msg, path);
})

bot.onText(/^downloadImg$/, (msg: telegramBot.Message) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    const path: string = "./images/";
    downloadAll(bot, msg, path, false);
})




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
    if (!process.env.CHANNEL) {
        bot.sendMessage(msg.chat.id, "Please set the CHANNEL environment variable");
    }
    bot.sendMessage(process.env.CHANNEL as string, message);
})
bot.onText(/\/subscribe/, (msg: telegramBot.Message) => {
    bot.sendMessage(msg.chat.id, "Subscribed to the channel")
    const Link: string = "https://api.waifu.im/search/?is_nsfw=false";
    setInterval(() => {
        bot.sendMessage(msg.chat.id, "A new waifu has arrived");
        getWaifu(bot, Link, msg)
    }, 1000 * 60 * 60 * 12);

})




// //////////////////////////////////////////////////////////////
//  for AI chat
// //////////////////////////////////////////////////////////////
bot.onText(/\/chat (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "Due to openAI's limitations, this command is only available to authorized users");
        return;
    }
    if (!match) {
        bot.sendMessage(msg.chat.id, "Please provide a message");
        return;
    }
    const message: string = match[1];
    botResponse(bot, msg, message, 0.9);
});

bot.onText(/\/translate (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "Due to openAI's limitations, this command is only available to authorized users");
        return;
    }
    if (!match) {
        bot.sendMessage(msg.chat.id, "Please provide a message");
        return;
    }
    const message: string = match[1];
    botResponse(bot, msg, message, 0,);
})

bot.onText(/\/generate (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "Due to openAI's limitations, this command is only available to authorized users");
        return;
    }
    if (!match) {
        bot.sendMessage(msg.chat.id, "Please provide a message");
        return;
    }
    const message: string = match[1];
    bot.sendMessage(msg.chat.id, "Generating...").then(() => {
        AiImage(bot, msg, message);
    })
})
// //////////////////////////////////////////////////////////////
//  for getting weather
// //////////////////////////////////////////////////////////////
// bot.onText(/\/weather (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
//     if (!match) {
//         bot.sendMessage(msg.chat.id, "Please provide a city name");
//         return;
//     }
//     const city: string = match[1];


//     const url: string = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
//     axios.get(url).then((res) => {
//         const data: any = res.data;
//         const weather: string = `Weather in ${data.name} is ${data.weather[0].description} with a temperature of ${data.main.temp}°C`;

//         bot.sendMessage(msg.chat.id, weather);
//     }).catch((err) => {
//         bot.sendMessage(msg.chat.id, "City not found");
//     })

// });



bot.on("polling_error", (msg) => {
    ++count;
    if (count == 5) {
        bot.close();
    }
    bot.sendMessage(msg.message, `Polling error ${count}`).catch((err) => { });

})

// console.log("Bot started");
// testAPI();
