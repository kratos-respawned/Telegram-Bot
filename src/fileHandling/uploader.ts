import * as telegramBot from "node-telegram-bot-api";
import * as fs from "fs";
import * as https from "https";

export default async function uploadFile(bot: telegramBot, msg: telegramBot.Message, name: string): Promise<void> {
    if (msg.reply_to_message?.photo) {
        const photo: telegramBot.PhotoSize = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
        const fileId: string = photo.file_id;
        bot.getFile(fileId).then((file: telegramBot.File) => {
            const url: string = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path}`;
            const extension: string = file.file_path?.split(".").pop() as string;
            const file_name: string = `${name}.${extension}`
            const file_path: string = `./uploads/${file_name}`;
            if (fs.existsSync(file_path)) {
                bot.sendMessage(msg.chat.id, "File already exists");
                return;
            }
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
}
