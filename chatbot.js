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
    'brittt'
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

function onMessageHandler (target, context, msg, self) {
  if(msg.toLowerCase() === '!lemon') {
    createPyramid(target, 'Lemon ', 4)
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