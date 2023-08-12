import { chatClient } from './chatbot'
import deezNutsJokes from './data/deeznuts.json'

function withCooldown(command: (channel: string, ...args: any[]) => Promise<void>, cooldownTimeSeconds: number = 2) {
  let isOnCooldown = false

  return async (channel: string, ...args: any[]) => {
    if (isOnCooldown) return
    isOnCooldown = true
    
    await command(channel, ...args)
    setTimeout(() => {
      isOnCooldown = false
    }, cooldownTimeSeconds*1000)
  }
}

export const createPyramid = withCooldown(async (channel: string, emote: string, pyramidSize: number)=>{
  let count = 1
  let down = false
  let interval = setInterval(() => {
    if(count <= pyramidSize && !down){
      chatClient.say(channel, emote.repeat(count))
      count++
      if(count === pyramidSize){
        down = true
      }
    }else if(count > 0 && down){
      chatClient.say(channel, emote.repeat(count))
      count--
    }else {
      clearInterval(interval)
    }
  }, 1500)
}, 1.5*5)

export const catFact = withCooldown(async (channel: string)=>{
  const result = await fetch('https://catfact.ninja/fact').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.fact)
  }, 2000)
})
export const joke = withCooldown(async (channel: string)=>{
  const result = await fetch('https://official-joke-api.appspot.com/random_joke').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.setup)
  }, 2000)
  setTimeout(()=>{
    chatClient.say(channel, result.punchline)
  }, 10000)
}, 10)
export const dogImage = withCooldown(async (channel: string)=>{
  const result = await fetch('https://dog.ceo/api/breeds/image/random').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.message)
  }, 2000)
})
export const catImage = withCooldown(async (channel: string)=>{
  const result = await fetch('https://api.thecatapi.com/v1/images/search').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result[0].url)
  }, 2000)
})
export const randomFact = withCooldown(async (channel: string)=>{
  const result = await fetch('https://uselessfacts.jsph.pl/random.json?language=en').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.text)
  }, 2000)
})
export const deezNuts = withCooldown(async (channel: string)=>{
  let random = Math.floor(Math.random() * deezNutsJokes.length)
  setTimeout(()=>{
    chatClient.say(channel, deezNutsJokes[random].prompt)
  }, 2000)
  setTimeout(()=>{
    chatClient.say(channel, deezNutsJokes[random].response + " GotEEM")
  }, 10000)
}, 10)

export function countUpTo(number: number, channel: string, emote: string){
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