import TelegramBot from "node-telegram-bot-api";
import fs from "fs";

export default async function downloader(bot: TelegramBot, msg: TelegramBot.Message, link: string) {

    const chatId: number = msg.chat.id;
    const message_id: number = msg.message_id;
    bot.sendMessage(chatId, "Downloading", {
        reply_to_message_id: message_id
    }).then((msg) => {
        if (!fs.existsSync('./uploads/' + link)) {
            bot.editMessageText("!!!File not found!!!", {
                chat_id: chatId,
                message_id: msg.message_id
            });
            return;
        }
        const stream = fs.createReadStream('./uploads/' + link);
        bot.sendDocument(chatId, stream).catch((err) => {
            console.log(err.message);
            bot.sendMessage(chatId, err.message);
        });
    })
}

export async function downloadAll(bot: TelegramBot, msg: TelegramBot.Message) {
    const chatId: number = msg.chat.id;
    const message_id: number = msg.message_id;

    var files = fs.readdirSync('./uploads');
    bot.sendMessage(chatId, "Downloading", {
        reply_to_message_id: message_id
    }).then(() => {
        files.forEach((file) => {
            const stream = fs.createReadStream('./uploads/' + file);
            bot.sendDocument(chatId, stream).catch((err) => {
                console.log(err.message);
                bot.sendMessage(chatId, err.message);
            }
            );
        });
    })

}

