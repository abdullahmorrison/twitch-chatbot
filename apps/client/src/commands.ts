import { chatClient } from './chatbot'
import deezNutsJokes from './data/deeznuts.json'

const isOnCooldown: Set<string> = new Set()
function withCooldown(command: (channel: string, ...args: any[]) => Promise<void>, cooldownTimeSeconds: number = 2) {
  return async (channel: string, ...args: any[]) => {
    if (isOnCooldown.has(channel)) return
    isOnCooldown.add(channel)
    
    await command(channel, ...args)
    setTimeout(() => {
      isOnCooldown.delete(channel)
    }, cooldownTimeSeconds*1000)
  }
}

const abdullahCommands = withCooldown(async (channel: string) => {
  setTimeout(() => {
    chatClient.say(channel, "MrDestructoid my bot commands 👉 "+ Object.keys(commandList).join(', '))
  }, 2000)
})  
const catFact = withCooldown(async (channel: string)=>{
  const result = await fetch('https://catfact.ninja/fact').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.fact)
  }, 2000)
})
const joke = withCooldown(async (channel: string)=>{
  const result = await fetch('https://official-joke-api.appspot.com/random_joke').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.setup)
  }, 2000)
  setTimeout(()=>{
    chatClient.say(channel, result.punchline)
  }, 10000)
}, 10)
const dogImage = withCooldown(async (channel: string)=>{
  const result = await fetch('https://dog.ceo/api/breeds/image/random').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.message)
  }, 2000)
})
const catImage = withCooldown(async (channel: string)=>{
  const result = await fetch('https://api.thecatapi.com/v1/images/search').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result[0].url)
  }, 2000)
})
const randomFact = withCooldown(async (channel: string)=>{
  const result = await fetch('https://uselessfacts.jsph.pl/random.json?language=en').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.text)
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

function countUpTo(number: number, channel: string, emote: string){
  let count = 2001
  let interval = setInterval(() => {
    if(count <= number){
      chatClient.say(channel, emote+' '+count)
      count++
    }else {
      clearInterval(interval)
    }
  }, 2500)
}

interface CommandList {
  [key: string]: (channel: string, user: string, args: string[]) => Promise<void>
}
const commandList: CommandList = {
  '!abdullahcommands': abdullahCommands,
  '!tellmeajoke': joke,
  '!randomfact': randomFact,
  '!dn': deezNuts,
  '!catfact': catFact,
  '!catimage': catImage,
  '!dogimage': dogImage
}
export default commandList