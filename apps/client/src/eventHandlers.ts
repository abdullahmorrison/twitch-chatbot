import * as commands from './commands'
import blacklist from './data/blacklist.json'

export function onConnectedHandler(addr: string, port: number) {
  console.log('\x1b[32m%s\x1b[0m', `* Connected to ${addr}:${port}`)
}
export function onDisconnectedHandler(reason: Error | undefined) {
  console.log('\x1b[31m%s\x1b[0m', `* Disconnected from server: ${reason? reason : 'Unknown'}`)
}

let lastMessage = Date.now()
export async function onMessageHandler(channel: string, user: string, msg: string) {
  for(let i = 0; i < blacklist.length; i++) //no commands for blacklisted users
    if(user === blacklist[i]) return
  
  switch(msg.split(' ')[0]){
    case '!catfact':
      await commands.catFact(channel)
      break
    case '!lemon':
      commands.createPyramid(channel, 'Lemon ', 4)
      break
    case '!tellmeajoke':
      await commands.joke(channel)
      break
    case '!dogimage':
      await commands.dogImage(channel)
      break
    case '!catimage':
      await commands.catImage(channel)
      break
    case '!randomfact':
      await commands.randomFact(channel)
      break
    case '!dn':
      await commands.deezNuts(channel)
      break
    default:
      break
  }
}

export function onStreamerOnline(channel: string){ //TODO
}
export function onStreamerOffline(channel: string){ //TODO
}
