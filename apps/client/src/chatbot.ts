import 'dotenv/config'
import { ChatClient } from '@twurple/chat'
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { trpcClient } from './trpcClient'
import { RefreshingAuthProvider } from '@twurple/auth'
import { onConnectedHandler, onDisconnectedHandler, onMessageHandler, onStreamerOnline, onStreamerOffline} from './eventHandlers'
import channels from './data/channels.json'

export let chatClient: ChatClient

const REJOIN_INTERVAL_MS = 60_000

const bare = (channel: string) => channel.replace(/^#/, '').toLowerCase()
const isSelf = (user: string) => user.toLowerCase() === chatClient.irc.currentNick?.toLowerCase()

// A ban drops the bot out of one channel and leaves everything else untouched -
// the socket stays up, every other channel keeps delivering, and no disconnect
// fires, so reconnect logic never runs and the bot is simply gone from that chat
// until someone restarts it. An unban does not bring it back on its own either.
// There is no event worth hanging this on: twitch parts the bot server-side and
// may send nothing we can act on, so compare what we are actually in against
// what we want and rejoin the difference.
async function rejoinMissingChannels(){
  const joined = new Set(chatClient.currentChannels.map(bare))
  for(const channel of channels){
    if(joined.has(bare(channel))) continue
    console.log('\x1b[36m%s\x1b[0m', `* Not in ${channel}, rejoining...`)
    // still banned is the normal case here - log it and let the next tick retry
    await chatClient.join(channel)
      .catch(e => console.error('\x1b[31m%s\x1b[0m', `* Rejoin failed for ${channel}: ${e}`))
  }
}

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
    console.log('\x1b[36m%s\x1b[0m', 'Saving new token...')
    await trpcClient.accessTokenUpdate.mutate(newTokenData.accessToken)
      .then(()=>console.log('\x1b[36m%s\x1b[0m', 'Token saved!'))
      .catch(()=>console.log('\x1b[31m%s\x1b[0m', 'Error saving token: '+newTokenData))
  })

  chatClient = new ChatClient({authProvider, channels: channels});

  chatClient.onMessage((channel, user, message, msg)=>onMessageHandler(channel, user, message, msg))
  chatClient.onConnect(() => onConnectedHandler(chatClient.irc.currentNick, chatClient.irc.port))
  chatClient.onDisconnect((_, reason) => onDisconnectedHandler(reason))
  // twitch sends JOIN/PART for every chatter, so only report our own
  chatClient.onJoin((channel, user) => isSelf(user) && console.log('\x1b[32m%s\x1b[0m', `* Joined ${channel}`))
  chatClient.onPart((channel, user) => isSelf(user) && console.log('\x1b[31m%s\x1b[0m', `* Left ${channel}`))
  chatClient.onJoinFailure((channel, reason) => console.log('\x1b[31m%s\x1b[0m', `* Could not join ${channel}: ${reason}`))
  await chatClient.connect()

  setInterval(rejoinMissingChannels, REJOIN_INTERVAL_MS)

  const apiClient = new ApiClient({ authProvider })
  const eventListener = new EventSubWsListener({ apiClient })
  eventListener.start()

  // const streamLiveListener = await eventListener.onStreamOnline('twitch', (e: { channelName: string })=>onStreamerOnline(e.channelName))
  // const streamOfflineListener = await eventListener.onStreamOffline('twitch', (e: { channelName: string; })=> onStreamerOffline(e.channelName))
}
main().catch(console.error)