import { exec } from "child_process";
import TelegramBot from "node-telegram-bot-api";
export default async function executeCommand(bot: TelegramBot, msg: TelegramBot.Message, command: string) {
    exec(command, (err, stdout, stderr) => {
        if (err) {
            bot.sendMessage(msg.chat.id, err.message, {
                reply_to_message_id: msg.message_id
            });
            return;
        }
        if (stderr) {
            bot.sendMessage(msg.chat.id, stderr, {
                reply_to_message_id: msg.message_id
            });
            return;
        }
        if (stdout.length === 0) { bot.sendMessage(msg.chat.id, "done"); return }
        bot.sendMessage(msg.chat.id, stdout, {
            reply_to_message_id: msg.message_id
        });
    })
}