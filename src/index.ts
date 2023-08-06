import 'dotenv/config'
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
export const client = new tmi.client(opts)
client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)
client.on('disconnected', onDisconnectedHandler)
client.connect()

let isOnCooldown = false

async function onMessageHandler(target: string, context: tmi.ChatUserstate, msg: string, self: boolean) {
  //no commands if streamer is live or a command is on cooldown
  if(isStreamerLive(target) || isOnCooldown) return 
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

function onConnectedHandler (addr: string, port: number) {
  console.log('\x1b[32m%s\x1b[0m', `Connected to ${addr}:${port}`)
}
function onDisconnectedHandler (reason: string) {
  console.log('\x1b[31m%s\x1b[0m', `Disconnected: ${reason}`)
}

function isStreamerLive(streamerName: string): boolean {
  fetch(`https://api.twitch.tv/helix/streams?user_login=${streamerName}`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID? process.env.TWITCH_CLIENT_ID : '', 
      'Authorization': process.env.TWITCH_OAUTH_TOKEN? 'Bearer '+process.env.TWITCH_OAUTH_TOKEN : ''
    }
  })
  .then(response => response.json())
    .then((data: any) => {
      if(data.data.length > 0){
        return true
      }else{
        return false
      }
  }).catch(error => console.error(error));
  return false
}