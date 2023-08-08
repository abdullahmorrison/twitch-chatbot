import 'dotenv/config'
import { ChatClient } from '@twurple/chat'
import { StaticAuthProvider, RefreshingAuthProvider } from '@twurple/auth'
import * as commands from './commands'
import blacklist from './data/blacklist.json'
import channels from './data/channels.json'
import { client } from './trpcClient'

export let chatClient: ChatClient

async function main(){
  console.log('\x1b[36m%s\x1b[0m', 'Starting bot...')

  const data = await client.accessToken.query()
  const token = data[0].token
  const authProvider = new StaticAuthProvider(process.env.TWITCH_CLIENT_ID as string, token)

  chatClient = new ChatClient({authProvider, channels: channels});

  chatClient.onMessage((channel, user, message)=>onMessageHandler(channel, user, message))
  chatClient.onConnect(() => onConnectedHandler(chatClient.irc.currentNick, chatClient.irc.port))
  chatClient.onDisconnect((_, reason) => onDisconnectedHandler(reason))
  await chatClient.connect()

  const refreshAuthProvider = new RefreshingAuthProvider({
    clientId: process.env.TWITCH_CLIENT_ID as string,
    clientSecret: process.env.TWITCH_CLIENT_SECRET as string,
  })
  await refreshAuthProvider.addUserForToken({
    accessToken: token,
    refreshToken: process.env.TWITCH_REFRESH_TOKEN as string,
    expiresIn: null,
    obtainmentTimestamp: 0
  }, ['chat'])
}
main().catch(console.error)

function onConnectedHandler(addr: string, port: number) {
  console.log('\x1b[32m%s\x1b[0m', `* Connected to ${addr}:${port}`)
}
function onDisconnectedHandler(reason: Error | undefined) {
  console.log('\x1b[31m%s\x1b[0m', `* Disconnected from server: ${reason? reason : 'Unknown'}`)
}

let isOnCooldown = false
async function onMessageHandler(channel: string, user: string, msg: string) {
  //no commands if streamer is live or a command is on cooldown
  // if(await isStreamerLive(channel) || isOnCooldown) return 
  for(let i = 0; i < blacklist.length; i++) //no commands for blacklisted users
    if(user === blacklist[i]) return
  
  isOnCooldown = true
  switch(msg.split(' ')[0]){
    case '!catfact':
      await commands.catFact(channel).then(() => isOnCooldown = false)
      break
    case '!lemon':
      commands.createPyramid(channel, 'Lemon ', 4)
      setTimeout(() => isOnCooldown = false, 10000)
      break
    case '!tellmeajoke':
      await commands.joke(channel).then(() => isOnCooldown = false)
    case '!dogimage':
      await commands.dogImage(channel).then(() => isOnCooldown = false)
      break
    case '!catimage':
      await commands.catImage(channel).then(() => isOnCooldown = false)
      break
    case '!randomfact':
      await commands.randomFact(channel).then(() => isOnCooldown = false)
      break
    case '!dn':
      await commands.deezNuts(channel).then(() => isOnCooldown = false)
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