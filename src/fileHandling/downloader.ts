import TelegramBot from "node-telegram-bot-api";
import fs from "fs";

export default async function downloader(bot: TelegramBot, msg: TelegramBot.Message, link: string, path: string, highQuality?: boolean) {

    const chatId: number = msg.chat.id;
    const message_id: number = msg.message_id;
    bot.sendMessage(chatId, "uploading", {
        reply_to_message_id: message_id
    }).then((msg) => {
        if (!fs.existsSync(path + link)) {
            bot.editMessageText("!!!File not found!!!", {
                chat_id: chatId,
                message_id: msg.message_id
            });
            return;
        }
        const stream = fs.createReadStream(path + link);
        if (typeof highQuality === "undefined") {
            bot.sendDocument(chatId, stream, {
                caption: link
            }, {
                filename: link
            }).catch((err) => {
                console.log(err.message);
                bot.sendMessage(chatId, err.message);
            });
        } else
            if (!highQuality) {
                bot.sendPhoto(chatId, stream, {
                    caption: link
                }, {
                    filename: link
                }).catch((err) => {
                    console.log(err.message);
                    bot.sendMessage(chatId, err.message);
                });
            }
    })
}

export async function downloadAll(bot: TelegramBot, msg: TelegramBot.Message, path: string, highQuality?: boolean) {

    const chatId: number = msg.chat.id;
    const message_id: number = msg.message_id;
    var files = fs.readdirSync(path);
    bot.sendMessage(chatId, "Downloading", {
        reply_to_message_id: message_id
    }).then(() => {
        files.forEach((file) => {
            const stream = fs.createReadStream(path + file);
            if (typeof highQuality === "undefined") {
                bot.sendDocument(chatId, stream).catch((err) => {
                    bot.sendMessage(chatId, err.message);
                }
                );
            } else if (!highQuality) {
                bot.sendPhoto(chatId, stream).catch((err) => {
                    bot.sendMessage(chatId, err.message);
                })
            }
        });
    })

}

