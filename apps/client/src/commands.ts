import { chatClient } from './chatbot'
import deezNutsJokes from './data/deeznuts.json'
import whyisbritttnotlive from './data/whyisbritttnotlive.json'

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
const catFact = withCooldown(async (channel: string, user: string)=>{
  const result = await fetch('https://catfact.ninja/fact').then(response => response.json())
  const emote = user === 'brittt' ? 'CoolCat' : 'Logre'
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
    ['!recipes', '!recipe'],
    ['!whyisbrittnotlive', '!whyisbritttnotlive'],
  ]
)
const commandList: CommandList = {
  '!abdullahcommands': {func: abdullahCommands},
  '!tellmeajoke': {func: joke},
  '!randomfact': {func: randomFact},
  '!dn': {func: deezNuts},
  '!catfact': {func: catFact},
  '!catimage': {func: catImage},
  '!dogimage': {func: dogImage},
  '!recipe': {func: recipe, exclusiveChannels: ['brittt']},
  '!whyisbritttnotlive': {func: whyIsBritttNotLive, exclusiveChannels: ['brittt']}
}
export default commandList
