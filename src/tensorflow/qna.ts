import qna from "@tensorflow-models/qna";

export async function answerQuestion(model: qna.QuestionAndAnswer, question: string, passage: string) {
    const answers = await model.findAnswers(question, passage);
    try {
        if (!answers[0]) {
            return "Unable to answer";
        }
        return answers[0].text as string;
    } catch {
        return "Error";
    }
}