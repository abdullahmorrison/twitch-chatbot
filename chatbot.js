import dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch'
import tmi from 'tmi.js'

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
  refreshToken()
})

client.connect()

const refreshToken = async () => {
  console.log('Refreshing token... \n')

  const refreshUrl = 'https://id.twitch.tv/oauth2/token?'
    + 'grant_type=refresh_token'
    + '&refresh_token='+ process.env.TWITCH_REFRESH_TOKEN 
    + '&client_id=' + process.env.TWITCH_CLIENT_ID 
    + '&client_secret=' + process.env.TWITCH_CLIENT_SECRET

  const response = await fetch(refreshUrl, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  if(!response.ok){
    console.log('Error refreshing token')
    client.disconnect()
    return
  }else{
    const json = await response.json()
    client.opts.identity.password = 'oauth:'+json.access_token
    client.connect()
  }
}

let previousMessage = ""
let count = 1
function onMessageHandler (target, context, msg, self) {
  const pyramidChecker = msg.split(' ')
  if(context.username == 'sh3dder' && pyramidChecker.length == 2 && pyramidChecker[0] == pyramidChecker[1] && pyramidChecker[0] == previousMessage){
    client.say(target, 'kek cucking @sh3dder \'s pyramid #'+count)
    count++
    previousMessage = ""
    return
  }else{
    previousMessage = ""
  }

  switch(msg){
    case '!catfact':
      catFact(target)
      break
    case '!lemon':
      createPyramid(target, 'Lemon ', 4)
      break
    case '!tellmeajoke':
      joke(target)
    default:
      break
  }
  if(target == '#erobb221'){
    previousMessage = msg
  }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
  countUpTo(2000, 'erobb221', 'Lemon ')
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