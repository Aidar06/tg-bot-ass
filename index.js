const {Telegraf} = require('telegraf') // import telegram lib
const axios = require('axios');

require('dotenv').config();

const BOT_TOKEN = '7184864379:AAFVgIxpkiIwBzj_BVw_IidD7b7I-NdEVu8'
const VOICEFLOW_API_KEY = 'VF.DM.65d22567652117992d05c086.UZXk6sdKvWJ6UO2c'

const bot = new Telegraf(BOT_TOKEN) // get the token from environment variable

async function interact(ctx, chatID, request) {

    const response = await axios({
        method: "POST",
        url: `https://general-runtime.voiceflow.com/state/user/${chatID}/interact`,
        headers: {
            Authorization: VOICEFLOW_API_KEY
        },
        data: {
            request
        }
    });
    for (const trace of response.data) {
        switch (trace.type) {
            case "text":
            case "speak":
            {
                await ctx.reply(trace.payload.message);
                break;
            }
            case "visual":
            {
                await ctx.replyWithPhoto(trace.payload.image);
                break;
            }
            case "end":
            {
                await ctx.reply("Conversation is over")
                break;
            }
        }
    }
};


bot.start(async (ctx) => {
    let chatID = ctx.message.chat.id;
    await interact(ctx, chatID, {type: "launch"});
});

const ANY_WORD_REGEX = new RegExp(/(.+)/i);
bot.hears(ANY_WORD_REGEX, async (ctx) => {
    let chatID = ctx.message.chat.id;
    await interact(ctx, chatID, {
        type: "text",
        payload: ctx.message.text
    });
});

bot.launch() // start

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))