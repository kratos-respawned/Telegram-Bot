import telegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import fs from "fs"
// import 
// import { answerQuestion } from "./tensorflow/qna.js"
////////////////////////////////////////////////////////////////// 
// modules
////////////////////////////////////////////////////////////////// 
import { AiImage, botResponse, startAI } from "./ai.js"
import downloader, { downloadAll } from "./fileHandling/downloader.js"
import executeCommand from "./execution/execute.js"
import getWaifu from "./anime/getWaifu.js"
import uploadImage, { uploader } from "./fileHandling/uploader.js"
// import qna from "@tensorflow-models/qna"
// import "@tensorflow/tfjs-node"
// console.log("Loading Model");
// const model = await qna.load();
// console.log("Model Loaded");
// //////////////////////////////////////////////////////////
dotenv.config();
startAI();
const TOKEN = process.env.TOKEN;
if (!TOKEN) throw new Error("Token not found");
if (!process.env.ADMIN) throw new Error("Admin not found");

const bot = new telegramBot(TOKEN, { polling: true })
////////////////////////////////////////////////////////////

const isAuthorized = (msg: telegramBot.Message): boolean => {
    return msg.from?.id === Number(process.env.ADMIN)
};

////////////////////////////////////////////////////////////
bot.sendMessage(process.env.ADMIN, "Bot started");

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
    console.log("Created uploads folder");
}

if (!fs.existsSync("images")) {
    fs.mkdirSync("images");
    console.log("Created images folder");
}

bot.onText(/^\/start$/, (msg: telegramBot.Message) => {
    bot.sendMessage(msg.chat.id, "Hello World");
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

bot.onText(/^\/downloadAll$/, (msg: telegramBot.Message) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    const path: string = "./uploads/";
    downloadAll(bot, msg, path);
});


bot.onText(/\/upload (.+)/, (msg: telegramBot.Message, match) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    if (!match) return;
    const name = match[1];
    // const path: string = "./uploads/";
    if (msg.reply_to_message?.video) {
        const video = msg.reply_to_message?.video;
        console.log(video);
        const file_id = video?.file_id;
        uploader(bot, msg, file_id, name);
        return;
    }
    if (msg.reply_to_message?.document) {
        const doc = msg.reply_to_message?.document;
        console.log(doc);
        const file_id = doc?.file_id;
        uploader(bot, msg, file_id, name);
        return;
    }
    if (msg.reply_to_message?.photo) {
        const name = match[1];
        uploadImage(bot, msg, name);
        return;
    }
    if (msg.reply_to_message?.audio) {
        const audio = msg.reply_to_message?.audio;
        console.log(audio);
        const file_id = audio?.file_id;
        if (!audio.title) { uploader(bot, msg, file_id, name); return; }
        uploader(bot, msg, file_id, audio.title);
        return;
    }
});


bot.onText(/^\/getimagesq$/, (msg: telegramBot.Message) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    const path: string = "./images/";
    downloadAll(bot, msg, path);
})

bot.onText(/^\/getimages$/, (msg: telegramBot.Message) => {
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
bot.onText(/^\/send$/, (msg: telegramBot.Message) => {
    if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, "You are not authorized to use this command");
        return;
    }
    if (!msg.reply_to_message) {
        bot.sendMessage(msg.chat.id, "Please reply to a message");
        return;
    }
    if (!process.env.CHANNEL) {
        bot.sendMessage(msg.chat.id, "Please set the CHANNEL environment variable");
    }
    if (msg.reply_to_message?.photo) {
        bot.sendPhoto(process.env.CHANNEL as string, msg.reply_to_message.photo[0].file_id);
    }
    if (msg.reply_to_message?.video) {
        bot.sendVideo(process.env.CHANNEL as string, msg.reply_to_message.video.file_id);
    }
    if (msg.reply_to_message?.text) {
        bot.sendMessage(process.env.CHANNEL as string, msg.reply_to_message.text);
    }

})




type Subscription = {
    id: number;
    timer: NodeJS.Timeout | undefined;
}
let subscribed: Subscription[] = [];
bot.onText(/^\/subscribe$/, (msg: telegramBot.Message) => {
    const Link: string = "https://api.waifu.im/search/?is_nsfw=false";
    const y = subscribed.some((sub) => sub.id === msg.chat.id);
    if (!y) {
        bot.sendMessage(msg.chat.id, "You are now subscribed");
        const timer = setInterval(() => {
            bot.sendMessage(msg.chat.id, ` A new waifu has arrived :: ${msg.chat.first_name || msg.chat.title} `);
            getWaifu(bot, Link, msg)
        }, 10000);
        subscribed.push({
            id: msg.chat.id,
            timer
        })
    } else {
        bot.sendMessage(msg.chat.id, "You are already subscribed");
        return;
    }
    console.log(subscribed);
})
bot.onText(/^\/unsubscribe$/, (msg: telegramBot.Message) => {
    const x = subscribed.find((sub) => sub.id === msg.chat.id);
    if (!x) {
        bot.sendMessage(msg.chat.id, "You are not subscribed ", {
            reply_to_message_id: msg.message_id
        });
        return;
    }
    clearInterval(x.timer);
    subscribed = subscribed.filter((sub) => sub.id !== msg.chat.id);
    bot.sendMessage(msg.chat.id, "Unsubscribed to the channel")
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

// ///////////////////////////////////
//  for tensorflow
//////////////////////////////////////
// bot.onText(/\/answer (.+)/, (msg: telegramBot.Message, match: RegExpExecArray | null) => {
//     if (!match)
//         return;
//     const question: string = match[1];
//     const passage = msg.reply_to_message?.text;
//     if (!passage) {
//         bot.sendMessage(msg.chat.id, "Please reply to a message containing the passage");
//         return;
//     }
//     if (!model) {
//         console.log("Loading model...");
//         bot.sendMessage(msg.chat.id
//             , "Model not loaded");
//         return;
//     }
//     bot.sendMessage(msg.chat.id, "Generating...").then(async (msg) => {
//         const solution = await answerQuestion(model, bot, question, passage);
//         bot.editMessageText(solution, {
//             message_id: msg.message_id,
//             chat_id: msg.chat.id
//         })
//     });
// });


