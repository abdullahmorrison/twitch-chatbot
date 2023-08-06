import 'dotenv/config'
import fetch from 'node-fetch'
import tmi from 'tmi.js'
import * as commands from './commands'
import blacklist from './data/blacklist.json'
import channels from './data/channels.json'

const opts = {
  identity: {
    username: 'abdullahmorrison',
    password: 'oauth:'+process.env.TWITCH_OAUTH_TOKEN
  },
  channels: channels
}
export let client = new tmi.client(opts)
client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)
client.on('disconnected', onDisconnectedHandler)
client.connect()

function onConnectedHandler (addr: string, port: number) {
  console.log('\x1b[32m%s\x1b[0m', `Connected to ${addr}:${port}`)
  setUpTokenRefresh()
}
function onDisconnectedHandler (reason: string) {
  console.log('\x1b[31m%s\x1b[0m', `Disconnected: ${reason}`)
}

async function setUpTokenRefresh(){
  console.log('setting up token refresh...')
  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token?'
      +'client_id='+process.env.TWITCH_CLIENT_ID
      +'&client_secret='+process.env.TWITCH_CLIENT_SECRET
      +'&grant_type=refresh_token'
      +'&refresh_token='+process.env.TWITCH_REFRESH_TOKEN, 
    {
      method: 'POST'
    })

    const data = await response.json()

    opts.identity.password = 'oauth:'+data.access_token
    setTimeout(setUpTokenRefresh, data.expires_in * 1000)
    console.log('token set up successfully.')
  } catch (error) {
    console.log('\x1b[33m%s\x1b[0m', 'Error refreshing token: '+error)
  }
}

let isOnCooldown = false

async function onMessageHandler(target: string, context: tmi.ChatUserstate, msg: string, self: boolean) {
  //no commands if streamer is live or a command is on cooldown
  console.log(target)
  if(await isStreamerLive(target) || isOnCooldown) return 
  for(let i = 0; i < blacklist.length; i++) //no commands for blacklisted users
    if(context.username === blacklist[i]) return
  
  isOnCooldown = true
  switch(msg.split(' ')[0]){
    case '!catfact':
      await commands.catFact(target).then(() => isOnCooldown = false)
      break
    case '!lemon':
      commands.createPyramid(target, 'Lemon ', 4)
      break
    case '!tellmeajoke':
      await commands.joke(target).then(() => isOnCooldown = false)
    case '!dogimage':
      await commands.dogImage(target).then(() => isOnCooldown = false)
      break
    case '!catimage':
      await commands.catImage(target).then(() => isOnCooldown = false)
      break
    case '!randomfact':
      await commands.randomFact(target).then(() => isOnCooldown = false)
      break
    case '!dn':
      await commands.deezNuts(target).then(() => isOnCooldown = false)
    default:
      isOnCooldown = false
      break
  }
}

async function isStreamerLive(streamerName: string): Promise<boolean>{
  try{
    const response = await fetch('https://api.twitch.tv/helix/streams?user_login='+streamerName.replace('#',''), {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID || '',
        'Authorization': 'Bearer '+process.env.TWITCH_OAUTH_TOKEN || ''
      }
  })
    const data = await response.json()
    if(data.data.length > 0) return true
  }catch(error){
    console.log('\x1b[33m%s\x1b[0m', 'Error getting streamer status: '+error)
  }
  return false  
}