import { chatClient } from "./chatbot"
import { withCooldown } from "./commands"

const delaySeconds = (sec: number) => new Promise(resolve => setTimeout(resolve, sec*1000))
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
const askQuestion = async (channel: string, qNum: number) => {
    const result = await fetch("https://the-trivia-api.com/v2/questions?difficulties=easy&limit=1").then(response => response.json())

    await delaySeconds(2)
    chatClient.say(channel, "Question #"+qNum+": "+result[0].question.text)

    //format the answers
    let answers = [...result[0].incorrectAnswers, result[0].correctAnswer]
    shuffleArray(answers)
    let letters = ['a', 'b', 'c', 'd']
    let answerArray: string[] = []
    for(let i = 0; i < answers.length; i++) answerArray.push(letters[i] + ") " + answers[i])

    await delaySeconds(5)
    chatClient.say(channel, "Is it: "+answerArray.join(', '))

    await delaySeconds(30)
    chatClient.say(channel, "The correct answer is.... " + answerArray.filter((answer: string) => answer.includes(result[0].correctAnswer)))
}
const giveGameInstructions = async (channel: string, numQuestions: number) => {
        await delaySeconds(5)
        chatClient.say(channel, "You will be asked "+numQuestions+" multiple choice questions.") 
        await delaySeconds(5)
        chatClient.say(channel, "You will have 30 seconds to answer each question.") 
        await delaySeconds(5)
        chatClient.say(channel, "Answer each question with a letter. Anyone who answers correctly will get a 100 points.")
        await delaySeconds(5)
        chatClient.say(channel, "The person with the most points at the end of the game will win a prize! 🎁")
        await delaySeconds(5)
}

const startTrivia = async (channel: string) => {
    try{
        const numQuestions = 3

        await delaySeconds(2)
        chatClient.say(channel, "Welcome to... 🌟Abdullah Morrison's Trivia Game Show!🌟 ")

        await giveGameInstructions(channel, numQuestions)

        chatClient.say(channel, "ARE YOU READY!!!???")
        await delaySeconds(5)

        //Type !join to join the game

        for(let i=1; i<=numQuestions; i++) {
            await delaySeconds(2)
            await askQuestion(channel, i)

            //record the answers and give points to correct answers

            await delaySeconds(2)
            //end after 3 question
            if(i == 3) chatClient.say(channel, "That's all the questions for today! Thanks for playing!")
        }


        //Reveal the winner/s
    }catch(err){
        console.log(err)
        chatClient.say(channel, "Oops! The bot crashed! @AbdullahMorrison can't code for shit. 🫵 TylerLaughingAtYou")
    }
}
export default startTrivia