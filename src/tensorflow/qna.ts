import qna from "@tensorflow-models/qna";
import TelegramBot from "node-telegram-bot-api";

export async function answerQuestion(model: qna.QuestionAndAnswer, bot: TelegramBot, question: string, passage: string) {
    const answers = model.findAnswers(question, passage);
    try {
        if (!answers[0]) {
            return "Error";
        }
        return answers[0].text as string;
    } catch {
        return "Error";
    }
}