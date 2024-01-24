import { chatClient } from './chatbot'
import deezNutsJokes from './data/deeznuts.json'
import lokipics from './data/lokipics.json'
import whyisbritttnotlive from './data/whyisbritttnotlive.json'
import compliments from 'cheer-me-up'

const isOnCooldown: Set<string> = new Set()
function withCooldown(command: (channel: string, ...args: any[]) => Promise<void>, cooldownTimeSeconds: number = 2) {
  return async (channel: string, ...args: any[]) => {
    if (isOnCooldown.has(channel)) return
    isOnCooldown.add(channel)
    
    try{
      await command(channel, ...args)
    }catch(e){
      setTimeout(() => {
        chatClient.say(channel, "Command failed! @AbdullahMorrison sucks at coding") 
      }, 2000);
    }
    setTimeout(() => {
      isOnCooldown.delete(channel)
    }, cooldownTimeSeconds*1000)
  }
}

const abdullahCommands = withCooldown(async (channel: string) => {
  setTimeout(() => {
    chatClient.say(channel, "MrDestructoid my bot commands 👉 "+ 
      Object.keys(commandList).filter(command => !commandList[command].exclusiveChannels || commandList[command].exclusiveChannels?.includes(channel)).join(', '))
  }, 2000)
})  
const catFact = withCooldown(async (channel: string)=>{
  const result = await fetch('https://catfact.ninja/fact').then(response => response.json())
  const emote = channel === 'brittt' ? 'Logre' : 'CoolCat'
  setTimeout(()=>{
    chatClient.say(channel, emote+" "+result.fact)
  }, 2000)
})
const joke = withCooldown(async (channel: string)=>{
  const result = await fetch('https://official-joke-api.appspot.com/random_joke').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, "PepeLaugh "+result.setup)
  }, 2000)
  setTimeout(()=>{
    chatClient.say(channel, result.punchline+ " GotEEM")
  }, 10000)
}, 10)
const dogImage = withCooldown(async (channel: string)=>{
  const result = await fetch('https://random.dog/woof.json').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, "OhMyDog "+ result.url)
  }, 2000)
})
const catImage = withCooldown(async (channel: string)=>{
  const result = await fetch('https://api.thecatapi.com/v1/images/search').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, "CoolCat "+result[0].url)
  }, 2000)
})
const randomFact = withCooldown(async (channel: string)=>{
  let result = await fetch('https://uselessfacts.jsph.pl/random.json?language=en').then(response => response.json())
  while(result.text.length > 200){
    result = await fetch('https://uselessfacts.jsph.pl/random.json?language=en').then(response => response.json())
  }
  setTimeout(()=>{
    chatClient.say(channel, "NerdL "+result.text)
  }, 2000)
})
const deezNuts = withCooldown(async (channel: string)=>{
  let random = Math.floor(Math.random() * deezNutsJokes.length)
  setTimeout(()=>{
    chatClient.say(channel, deezNutsJokes[random].prompt)
  }, 2000)
  setTimeout(()=>{
    chatClient.say(channel, deezNutsJokes[random].response + " GotEEM")
  }, 10000)
}, 10)
const recipe = withCooldown(async (channel: string)=>{
  const result = await fetch('https://themealdb.com/api/json/v1/1/random.php').then(response => response.json())
  const tiktokURL = new URL('https://www.tiktok.com/search?q='+encodeURIComponent(result.meals[0].strMeal+' recipe'))
  setTimeout(()=>{
    chatClient.say(channel, "4WeirdChef "+ result.meals[0].strMeal+ " " + tiktokURL)
  }, 2000)
})
const whyIsBritttNotLive = withCooldown(async (channel: string, user: string)=>{
  setTimeout(()=>{
    if(user === 'brittt')
      chatClient.say(channel, "Texime I'm typing in chat instead of going live (go live FeelsWeirdMan )")
    else
      chatClient.say(channel, "Texime "+whyisbritttnotlive[Math.floor(Math.random() * whyisbritttnotlive.length)])
  }, 2000)
})
const wouldYouRather = withCooldown(async (channel: string)=>{
  const result = await fetch('https://would-you-rather-api.abaanshanid.repl.co/').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.data)
  }, 2000)
})
const riddle = withCooldown(async (channel: string)=>{
  const result = await fetch('https://riddles-api.vercel.app/random').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.riddle)
  }, 2000)
  setTimeout(()=>{
    chatClient.say(channel, result.answer)
  }, 20000)
}, 20)
const compliment = withCooldown(async (channel: string, _, args: string[])=>{
  const to = args[0] ? args[0].replace('@', '') : undefined
  
  setTimeout(()=>{
    chatClient.say(channel, to ? `@${to} ${compliments.getCompliment()}` : `${compliments.getCompliment()}`)
  }, 2000)
})
const lokipic = withCooldown(async (channel: string)=>{
  const random = Math.floor(Math.random() * lokipics.length)
  setTimeout(()=>{
    chatClient.say(channel, "Logre "+lokipics[random])
  }, 2000)
})
const fortune = withCooldown(async (channel: string, user: string)=>{
  const result = await fetch('https://fortune-cookie4.p.rapidapi.com/slack', {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY || '',
      'x-rapidapi-host': 'fortune-cookie4.p.rapidapi.com'
    }
  }).then(response => response.json())

  setTimeout(()=>{
    chatClient.say(channel, "@"+user+" "+result.text)
  }, 2000)
})

interface Command {
  func: (channel: string, user: string, args: string[]) => Promise<void>,
  exclusiveChannels?: string[],
}
interface CommandList {
  [key: string]: Command
}
export const commandAliasList = new Map<string, string>(
  [
    ['!joke', '!tellmeajoke'],
    ['!fact', '!randomfact'],
    ['!cat', '!catimage'],
    ['!lokifact', '!catfact'],
    ['!catpic', '!catimage'],
    ['!dog', '!dogimage'],
    ['!dogpic', '!dogimage'],
    ['!lokiimage', '!lokipic'],
    ['!recipes', '!recipe'],
    ['!tiktokrecipe', '!recipe'],
    ['!whyisbrittnotlive', '!whyisbritttnotlive'],
  ]
)
const commandList: CommandList = {
  '!abdullahcommands': {func: abdullahCommands},
  '!tellmeajoke': {func: joke},
  '!randomfact': {func: randomFact},
  '!dn': {func: deezNuts},
  '!compliment': {func: compliment},
  '!riddle': {func: riddle},
  '!catfact': {func: catFact},
  '!catimage': {func: catImage},
  '!dogimage': {func: dogImage},
  '!wouldyourather': {func: wouldYouRather},
  '!recipe': {func: recipe, exclusiveChannels: ['brittt']},
  '!whyisbritttnotlive': {func: whyIsBritttNotLive, exclusiveChannels: ['brittt']},
  '!lokipic': {func: lokipic, exclusiveChannels: ['brittt']},
  '!fortune': {func: fortune}

}
export default commandList
