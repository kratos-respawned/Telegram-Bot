import TelegramBot from "node-telegram-bot-api";
import { Waifu } from "../typings/types";
import fs from "fs"
import axios from "axios";
import sharp from "sharp";
export default async function getWaifu(bot: TelegramBot, link: string, msg: TelegramBot.Message, Reply?: boolean) {
    const chatId: number = msg.chat.id;
    try {
        const response = await axios.get(link);
        const data: Waifu = await response.data;
        const url: string = data.images[0].url;
        console.log(data);
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
        }).catch(async () => {
            const newMsg = await bot.sendMessage(chatId, "Large Image \nDownloading");
            axios({
                method: 'get',
                url: url,
                responseType: 'arraybuffer',
            }).then((response) => {
                fs.writeFileSync(`./images/highQuality_${data.images[0].signature}${data.images[0].extension}`, response.data);
                sharp(response.data)
                    .resize(data.images[0].width, data.images[0].height)
                    .toFormat('webp', { quality: 80 })
                    .toFile(`./images/${data.images[0].signature}.jpg`, (err) => {
                        if (err) {
                            bot.sendMessage(chatId, err.message);
                        } else {
                            bot.deleteMessage(chatId, newMsg.message_id.toString());
                            bot.sendPhoto(chatId, `./images/${data.images[0].signature}.jpg`, {
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
                            }).then(() => {

                                fs.unlink(`./images/${data.images[0].signature}.jpg`, (err) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            });
                        }
                    });
            }).catch((err) => {
                bot.sendMessage(chatId, err.message);
            });
        });

    } catch (error) {
        bot.sendMessage(chatId, error.message);
    }
}




