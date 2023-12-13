import { chatClient } from './chatbot'
import  commandList,  { commandAliasList } from './commands'
import { trpcClient } from './trpcClient'

export function onConnectedHandler(addr: string, port: number) {
  console.log('\x1b[32m%s\x1b[0m', `* Connected to ${addr}:${port}`)
}
export function onDisconnectedHandler(reason: Error | undefined) {
  console.log('\x1b[31m%s\x1b[0m', `* Disconnected from server: ${reason? reason : 'Unknown'}`)
}

//TODO: send the link to delete to the command
export async function onMessageHandler(channel: string, user: string, msg: string) {
  if(msg[0] === '!') {
    let commandName = msg.split(' ')[0]
    const args = msg.split(' ').slice(1)

    if(commandAliasList.has(commandName)) commandName = commandAliasList.get(commandName) || "" //if command is an alias, get the actual command name
       
    // check if command exists in commandList AND that command is not exclusive to another channel OR that the command is exclusive the channel the command was sent in
    if(commandName in commandList && (!commandList[commandName].exclusiveChannels || commandList[commandName].exclusiveChannels?.includes(channel))) {
      try {
        await commandList[commandName].func(channel, user, args) 
      } catch(e) {
        console.log(e)
      }
    }
  }else if(channel=='erobb221'
          && msg.includes('streamable.com') 
          || msg.includes('clips.twitch.tv') 
          || msg.includes('youtube.com/clip/')) {//save links pasted in erobb's chat
    if(user == 'abdullahmorrisonbot') return //this is me
    if(user == 'oldmanburger' || user == 'transerobber') return //these guys link gross stuff

    const link = msg.split(' ').filter(str => str.includes('https://'))
    try{
      if(link[0]) 
        trpcClient.linkCreate.mutate(link[0])
    }catch(e){
      console.log(link[0])
      console.log(e)
    }
  }
  if(user==='brittt'){//repeat what brittt types in chat
    chatClient.say(channel, msg)
  }
}


export function onStreamerOnline(channel: string){ //TODO
}
export function onStreamerOffline(channel: string){ //TODO
}
