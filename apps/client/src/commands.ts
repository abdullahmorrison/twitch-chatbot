import { chatClient } from './chatbot'
import deezNutsJokes from './data/deeznuts.json'
import { trpcClient } from './trpcClient'

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
    chatClient.say(channel, "MrDestructoid my bot commands 👉 "+ 
      Object.keys(commandList).filter(command => !commandList[command].exclusiveChannels || commandList[command].exclusiveChannels?.includes(channel)).join(', '))
  }, 2000)
})  
const catFact = withCooldown(async (channel: string)=>{
  const result = await fetch('https://catfact.ninja/fact').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, "CoolCat "+result.fact)
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
  const result = await fetch('https://uselessfacts.jsph.pl/random.json?language=en').then(response => response.json())
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
const erobbLink = withCooldown(async (channel: string)=>{
  setTimeout(()=>{
    chatClient.say(channel, "Lemao The golden sun rises in the east, The light shines. Dongfeng Wanli, flowers are open, The red flag is like a big ocean. Great mentor, wise leader, Dear Chairman Mao! The sun is in the hearts of the revolutionary people, The red sun in the heart. Long live Chairman Mao!")
  }, 2000)
})
const removelink = withCooldown(async (channel: string, user: string, link: string)=>{
  setTimeout(async ()=>{
    if(user != 'abdullahmorrison'){
      chatClient.say(channel, "arnoldHalt Only @AbdullahMorrison can remove links!")      
    }else{
      const result = await trpcClient.linkDelete.mutate(link)

      if(!result) chatClient.say(channel, "MrDestructoid Link not found!")
      else chatClient.say(channel, "MrDestructoid Link removed!")
    }
  }, 2000)
})

interface CommandList {
  [key: string]: { func: (channel: string, user: string, args: string[]) => Promise<void>, exclusiveChannels?: string[] }
}
const commandList: CommandList = {
  '!abdullahcommands': {func: abdullahCommands},
  '!tellmeajoke': {func: joke},
  '!randomfact': {func: randomFact},
  '!dn': {func: deezNuts},
  '!catfact': {func: catFact},
  '!catimage': {func: catImage},
  '!dogimage': {func: dogImage},
  '!recipe': {func: recipe, exclusiveChannels: ['brittt']},
  '!erobblink': {func: erobbLink, exclusiveChannels: ['erobb221']},
  '!removelink': {func: removelink}
}
export default commandList