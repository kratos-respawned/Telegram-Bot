import { Configuration, OpenAIApi } from "openai";
import fs from "fs"
export async function testAPI() {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
    const config = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG
    });
    const openai = new OpenAIApi(config);
    const test = await openai.createCompletion({
        model: "text-curie-001",
        // max_tokens: 5,
        prompt: "translate: en: Hello how are you \ n \ n translate: fr:",
        temperature: 0.9,
    });
    // const test2 = await openai.createImage()
    console.log(test.data);

}
