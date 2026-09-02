import { chatClient } from './chatbot'

export function onConnectedHandler(addr: string, port: number) {
  console.log('\x1b[32m%s\x1b[0m', `* Connected to ${addr}:${port}`)
}
export function onDisconnectedHandler(reason: Error | undefined) {
  console.log('\x1b[31m%s\x1b[0m', `* Disconnected from server: ${reason? reason : 'Unknown'}`)
}

const MIN_PYRAMID_HEIGHT = 3
const OWNER = 'abdullahmorrison'
const OWNER_CHANNEL = 'abdullahmorrison' // test channel - OWNER is fair game here

// twurple may hand us '#channel' or 'channel' depending on version
const channelName = (channel: string) => channel.replace(/^#/, '').toLowerCase()
const PYRAMID_TIMEOUT_MS = 60_000

// one in-progress pyramid attempt per channel - anyone else talking breaks it
type Attempt = { user: string, token: string, counts: number[], updatedAt: number }
const attempts = new Map<string, Attempt>()

const blockMessages = [
  'no pyramids in this chat Madge',
  'pyramid denied Sadge',
  'not today buddy OMEGALUL',
  'this pyramid has been demolished LULW',
  'blocked NOPERS',
  'so close ThatsBait',
  'pyramid scheme detected Susge',
  'construction permit denied Clueless',
  'the pharaoh says no NOIDONTTHINKSO',
  'nice try KEK'
]
let blockMessageIndex = Math.floor(Math.random() * blockMessages.length)
function nextBlockMessage(): string {
  // walk the list so the same message never goes out twice in a row
  blockMessageIndex = (blockMessageIndex + 1) % blockMessages.length
  return blockMessages[blockMessageIndex]
}

// chatters prepend invisible characters to dodge twitch's duplicate-message
// filter - U+034F is the common one. Strip them or the unit never matches.
const INVISIBLE = /[\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF]|\uDB40[\uDC00-\uDC7F]/g

// A pyramid row is some unit repeated. The unit is usually one emote but can be
// several ("TriHard weLive TriHard weLive" is 2 of "TriHard weLive"), so take the
// shortest slice the whole row is built from.
function parseRepeat(msg: string): { token: string, count: number } | null {
  const parts = msg.replace(INVISIBLE, ' ').trim().split(/\s+/).filter(Boolean)
  if(parts.length === 0) return null

  for(let size = 1; size <= parts.length; size++){
    if(parts.length % size !== 0) continue
    if(parts.every((p, i) => p === parts[i % size]))
      return { token: parts.slice(0, size).join(' '), count: parts.length / size }
  }
  return null
}

// counts must go 1,2,3...peak then peak-1,peak-2... with no gaps
function isPyramidPrefix(counts: number[]): boolean {
  if(counts[0] !== 1) return false
  let peaked = false
  for(let i = 1; i < counts.length; i++){
    if(!peaked && counts[i] === counts[i-1] + 1) continue
    if(counts[i] === counts[i-1] - 1){
      peaked = true
      continue
    }
    return false
  }
  return true
}

const startedAt = Date.now()
function uptime(): string {
  const mins = Math.floor((Date.now() - startedAt) / 60_000)
  if(mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if(hours < 24) return `${hours}h${mins % 60}m`
  return `${Math.floor(hours / 24)}d${hours % 24}h`
}

let paused = false
export async function onMessageHandler(channel: string, user: string, msg: string) {
  // answers even while paused - the point is to prove the bot is reachable
  if(user === OWNER && msg === '!heartbeat'){
    chatClient.say(channel, `@${user} weLive alive, up ${uptime()}, ${paused ? 'PAUSED' : 'watching for pyramids'}`)
    return
  }
  if(user === OWNER && msg === '!pause'){
    chatClient.say(channel, 'bot has been paused Bedge')
    paused = true
    return
  }
  if(user === OWNER && msg === '!unpause'){
    chatClient.say(channel, 'bot has been unpaused weLive')
    paused = false
    return
  }
  if(paused) return

  if(user.toLowerCase() === chatClient.irc.currentNick?.toLowerCase()) return

  const repeat = parseRepeat(msg)
  if(!repeat){
    attempts.delete(channel)
    return
  }

  const now = Date.now()
  const existing = attempts.get(channel)
  const continues = existing
    && existing.user === user
    && existing.token === repeat.token
    && now - existing.updatedAt < PYRAMID_TIMEOUT_MS
  const counts = continues ? [...existing!.counts, repeat.count] : [repeat.count]

  if(!isPyramidPrefix(counts)){
    // this message can still be the start of a fresh pyramid
    if(repeat.count === 1) attempts.set(channel, { user, token: repeat.token, counts: [1], updatedAt: now })
    else attempts.delete(channel)
    return
  }

  const prev = counts[counts.length - 2]
  const descending = counts.length > 1 && repeat.count < prev
  const peak = Math.max(...counts)

  // one message away from finishing: peak is tall enough and they're back down to 2
  if(descending && repeat.count === 2 && peak >= MIN_PYRAMID_HEIGHT){
    // OWNER is exempt everywhere except his own channel, so he can still test there
    if(user !== OWNER || channelName(channel) === OWNER_CHANNEL)
      chatClient.say(channel, `@${user} ${nextBlockMessage()}`)
    attempts.delete(channel)
    return
  }

  attempts.set(channel, { user, token: repeat.token, counts, updatedAt: now })
}

export function onStreamerOnline(channel: string){ //TODO
}
export function onStreamerOffline(channel: string){ //TODO
}
