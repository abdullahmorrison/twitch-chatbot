import  commandList from './commands'
import { trpcClient } from './trpcClient';

export function onConnectedHandler(addr: string, port: number) {
  console.log('\x1b[32m%s\x1b[0m', `* Connected to ${addr}:${port}`)
}
export function onDisconnectedHandler(reason: Error | undefined) {
  console.log('\x1b[31m%s\x1b[0m', `* Disconnected from server: ${reason? reason : 'Unknown'}`)
}

export async function onMessageHandler(channel: string, user: string, msg: string) {
  if(msg[0] === '!') {
    const commandName = msg.split(' ')[0]
    const args = msg.split(' ').slice(1)
    if(commandName in commandList && (!commandList[commandName].exclusiveChannels || commandList[commandName].exclusiveChannels?.includes(channel))) {
      try {
        await commandList[commandName].func(channel, user, args) 
      } catch(e) {
        console.log(e)
      }
    }
  }else if(channel=='abdullahmorrison'
          && msg.includes('streamable.com') 
          || msg.includes('clips.twitch.tv') 
          || msg.includes('youtube.com/clip/')) {//save links pasted in erobb's chat
    if(user == 'abdullahmorrisonbot') return //this is me
    if(user == 'oldmanburger' || user == 'transerobber') return //these guys link gross stuff

    const link = msg.split(' ').filter(str => str.includes('https://'))
    try{
      trpcClient.linkCreate.mutate(link[0])
    }catch(e){
      console.log(link[0])
      console.log(e)
    }
  }
}


export function onStreamerOnline(channel: string){ //TODO
}
export function onStreamerOffline(channel: string){ //TODO
}
