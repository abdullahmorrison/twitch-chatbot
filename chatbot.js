import dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch'
import tmi from 'tmi.js'
import deezNutsJokes from './deeznuts.json' assert { type: "json" }

const opts = {
  identity: {
    username: 'abdullahmorrison',
    password: 'oauth:'+process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [
    'abdullahmorrison',
    'brittt',
    'alveussanctuary',
    'erobb221',
  ]
}

const client = new tmi.client(opts)

client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)
client.on('disconnected', () => {
  console.log('Disconnected from server.')
})

client.connect()

const blacklist = [
  'rajji',
  'no_coms',
  'jaskcon_'
]

function onMessageHandler (target, context, msg, self) {
  for(let i = 0; i < blacklist.length; i++) //no commands for blacklisted users
    if(context.username === blacklist[i])
      return
  
  switch(msg.split(' ')[0]){
    case '!catfact':
      catFact(target)
      break
    case '!lemon':
      createPyramid(target, 'Lemon ', 4)
      break
    case '!tellmeajoke':
      joke(target)
    case '!dogimage':
      dogImage(target)
      break
    case '!catimage':
      catImage(target)
      break
    case '!randomfact':
      ranoomFact(target)
      break
    case '!dn':
      deezNuts(target)
    default:
      break
  }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}

function createPyramid(channel, emote, pyramidSize){
  let count = 1
  let down = false
  let interval = setInterval(() => {
    if(count <= pyramidSize && !down){
      client.say(channel, emote.repeat(count))
      count++
      if(count === pyramidSize){
        down = true
      }
    }else if(count > 0 && down){
      client.say(channel, emote.repeat(count))
      count--
    }else {
      clearInterval(interval)
    }
  }, 1500)
}

const catFact = async (channel)=>{
  const url = 'https://catfact.ninja/fact'
  const response = await fetch(url)
  const json = await response.json()
  setTimeout(()=>{
    client.say(channel, json.fact)
  }, 2000)
}
const joke = async (channel)=>{
  const url = 'https://official-joke-api.appspot.com/random_joke'
  const response = await fetch(url)
  const json = await response.json()
  setTimeout(()=>{
    client.say(channel, json.setup)
  }, 2000)
  setTimeout(()=>{
    client.say(channel, json.punchline)
  }, 10000)
}
const dogImage = async (channel)=>{
  const url = 'https://dog.ceo/api/breeds/image/random'
  const response = await fetch(url)
  const json = await response.json()
  setTimeout(()=>{
    client.say(channel, json.message)
  }
  , 2000)
}
const catImage = async (channel)=>{
  const url = 'https://api.thecatapi.com/v1/images/search'
  const response = await fetch(url)
  const json = await response.json()
  setTimeout(()=>{
    client.say(channel, json[0].url)
  }
  , 2000)
}
const ranoomFact = async (channel)=>{
  const url = 'https://uselessfacts.jsph.pl/random.json?language=en'
  const response = await fetch(url)
  const json = await response.json()
  setTimeout(()=>{
    client.say(channel, json.text)
  }
  , 2000)
}
const deezNuts = (channel)=>{
  let random = Math.floor(Math.random() * deezNutsJokes.length)
  setTimeout(()=>{
    client.say(channel, deezNutsJokes[random].prompt)
  }, 2000)
  setTimeout(()=>{
    client.say(channel, deezNutsJokes[random].response + " GottEEM")
  }, 10000)
}

function countUpTo(number, channel, emote){
  let count = 2001
  let interval = setInterval(() => {
    if(count <= number){
      client.say(channel, emote+' '+count)
      count++
    }else {
      clearInterval(interval)
    }
  }, 2500)
}