import * as commands from './commands'
import blacklist from './data/blacklist.json'

export function onConnectedHandler(addr: string, port: number) {
  console.log('\x1b[32m%s\x1b[0m', `* Connected to ${addr}:${port}`)
}
export function onDisconnectedHandler(reason: Error | undefined) {
  console.log('\x1b[31m%s\x1b[0m', `* Disconnected from server: ${reason? reason : 'Unknown'}`)
}

interface CommandList {
  [key: string]: (channel: string, user: string, args: string[]) => Promise<void>
}
const commandList: CommandList = {
  '!catfact': commands.catFact,
  '!tellmeajoke': commands.joke,
  '!dogimage': commands.dogImage,
  '!catimage': commands.catImage,
  '!randomfact': commands.randomFact,
  '!dn': commands.deezNuts
}
export async function onMessageHandler(channel: string, user: string, msg: string) {
  for(let i = 0; i < blacklist.length; i++) //no commands for blacklisted users
    if(user === blacklist[i]) return
  
  if(msg[0] === '!') {
    const commandName = msg.split(' ')[0]
    const args = msg.split(' ').slice(1)
    if(commandName in commandList) {
      try {
        await commandList[commandName](channel, user, args)
      } catch(e) {
        console.log(e)
      }
    }
  }
}


export function onStreamerOnline(channel: string){ //TODO
}
export function onStreamerOffline(channel: string){ //TODO
}
