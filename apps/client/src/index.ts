import 'dotenv/config'
import { ChatClient } from '@twurple/chat'
import { StaticAuthProvider, RefreshingAuthProvider } from '@twurple/auth'
import channels from './data/channels.json'
import { client } from './trpcClient'
import { onConnectedHandler, onDisconnectedHandler, onMessageHandler } from './eventHandlers'

export let chatClient: ChatClient

let token = ""
async function main(){
  console.log('\x1b[36m%s\x1b[0m', 'Starting bot...')

  const data = await client.accessToken.query()
  token = data[0].token
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
  refreshAuthProvider.onRefresh(async ()=>{
    const response = await fetch('https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=' 
      + process.env.TWITCH_REFRESH_TOKEN 
      + '&client_id=' + process.env.TWITCH_CLIENT_ID 
      + '&client_secret=' + process.env.TWITCH_CLIENT_SECRET, 
      { method: 'POST' })
    const data = await response.json()
    token = await client.accessTokenUpdate.mutate(data.access_token) as string
  })
}
main().catch(console.error)