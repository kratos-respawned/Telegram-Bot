import TelegramBot from "node-telegram-bot-api";
import { Waifu } from "../typings/types";

export default async function getWaifu(bot: TelegramBot, link: string, msg: TelegramBot.Message) {
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