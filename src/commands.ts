import { chatClient } from '.'
import deezNutsJokes from './data/deeznuts.json'

export function createPyramid(channel: string, emote: string, pyramidSize: number){
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
}

export async function catFact(channel: string){
  const result = await fetch('https://catfact.ninja/fact').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.fact)
  }, 2000)
}
export async function joke(channel: string){
  const result = await fetch('https://official-joke-api.appspot.com/random_joke').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.setup)
  }, 2000)
  setTimeout(()=>{
    chatClient.say(channel, result.punchline)
  }, 10000)
}
export async function dogImage(channel: string){
  const result = await fetch('https://dog.ceo/api/breeds/image/random').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.message)
  }, 2000)
}
export async function catImage(channel: string){
  const result = await fetch('https://api.thecatapi.com/v1/images/search').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result[0].url)
  }, 2000)
}
export async function randomFact(channel: string){
  const result = await fetch('https://uselessfacts.jsph.pl/random.json?language=en').then(response => response.json())
  setTimeout(()=>{
    chatClient.say(channel, result.text)
  }, 2000)
}
export async function deezNuts(channel: string){
  let random = Math.floor(Math.random() * deezNutsJokes.length)
  setTimeout(()=>{
    chatClient.say(channel, deezNutsJokes[random].prompt)
  }, 2000)
  setTimeout(()=>{
    chatClient.say(channel, deezNutsJokes[random].response + " GotEEM")
  }, 10000)
}

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