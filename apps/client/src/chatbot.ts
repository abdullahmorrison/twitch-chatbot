import 'dotenv/config'
import { ChatClient } from '@twurple/chat'
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { trpcClient } from './trpcClient'
import { RefreshingAuthProvider } from '@twurple/auth'
import { onConnectedHandler, onDisconnectedHandler, onMessageHandler, onStreamerOnline, onStreamerOffline} from './eventHandlers'
import channels from './data/channels.json'

export let chatClient: ChatClient

async function main(){
  console.log('\x1b[36m%s\x1b[0m', 'Starting bot...')

  const data = await trpcClient.accessToken.query()
  const token = (data[0] as { token: string }).token;

  const authProvider = new RefreshingAuthProvider({
    clientId: process.env.TWITCH_CLIENT_ID as string,
    clientSecret: process.env.TWITCH_CLIENT_SECRET as string,
  })
  await authProvider.addUserForToken({
    accessToken: token,
    refreshToken: process.env.TWITCH_REFRESH_TOKEN as string,
    expiresIn: 0,
    obtainmentTimestamp: 0
  }, ['chat'])
  authProvider.onRefresh(async (_, newTokenData)=>{
    console.log('\x1b[36m%s\x1b[0m', 'Token Refreshed')
    await trpcClient.accessTokenUpdate.mutate(newTokenData.accessToken)
  })

  chatClient = new ChatClient({authProvider, channels: channels});

  chatClient.onMessage((channel, user, message)=>onMessageHandler(channel, user, message))
  chatClient.onConnect(() => onConnectedHandler(chatClient.irc.currentNick, chatClient.irc.port))
  chatClient.onDisconnect((_, reason) => onDisconnectedHandler(reason))
  await chatClient.connect()

  const apiClient = new ApiClient({ authProvider })
  const eventListener = new EventSubWsListener({ apiClient })
  eventListener.start()

  // const streamLiveListener = await eventListener.onStreamOnline('twitch', (e: { channelName: string })=>onStreamerOnline(e.channelName))
  // const streamOfflineListener = await eventListener.onStreamOffline('twitch', (e: { channelName: string; })=> onStreamerOffline(e.channelName))
}
main().catch(console.error)