import { Configuration, OpenAIApi } from "openai";
var openai: OpenAIApi;


export async function testAPI() {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
    const config = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG
    });
    openai = new OpenAIApi(config);
    // lett();
}

export const lett = async () => {
    const test = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: " who is the best person in the world? ",
        temperature: 0,
    });
    // const test2 = await openai.createCompletion({
    //     model: "text-davinci-003",
    //     prompt: " who is the best person in the world? ",
    //     temperature: 0,    
    // })
    console.log(test.data);
}
