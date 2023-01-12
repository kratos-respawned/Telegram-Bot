import TelegramBot from "node-telegram-bot-api";
import { Waifu } from "../typings/types";
import fs from "fs"
import https from "https"
import downloader from "../fileHandling/downloader.js";
export default async function getWaifu(bot: TelegramBot, link: string, msg: TelegramBot.Message, Reply?: boolean) {
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
                bot.sendMessage(chatId, "Large Image \nDownloading").then((msg) => {
                    const url = data.images[0].url;
                    const name = data.images[0].signature + data.images[0].extension;
                    console.log(name);
                    const file = fs.createWriteStream(`./images/${name}`);
                    const request = https.get(url, function (response) {
                        response.pipe(file);
                        file.on("finish", () => {
                            file.close();
                            bot.editMessageText("Downloaded", {
                                chat_id: chatId,
                                message_id: msg.message_id
                            });
                            downloader(bot, msg, name, "./images/");
                        });
                    });
                })
            });
        });
    } catch (error) {
        bot.sendMessage(chatId, "Error");
    }
}