import { chatClient } from './chatbot'

export function onConnectedHandler(addr: string, port: number) {
  console.log('\x1b[32m%s\x1b[0m', `* Connected to ${addr}:${port}`)
}
export function onDisconnectedHandler(reason: Error | undefined) {
  console.log('\x1b[31m%s\x1b[0m', `* Disconnected from server: ${reason? reason : 'Unknown'}`)
}

const MIN_PYRAMID_HEIGHT = 3
const PYRAMID_TIMEOUT_MS = 300_000
const OWNER = 'abdullahmorrison'
const OWNER_CHANNEL = 'abdullahmorrison' // test channel - OWNER is fair game here

// twurple may hand us '#channel' or 'channel' depending on version
const channelName = (channel: string) => channel.replace(/^#/, '').toLowerCase()

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
const invertedMessages = [
  'upside down still counts Clueless',
  'flipping it does not help NOPERS',
  'inverted pyramid denied Madge',
  'thats a pyramid standing on its head OMEGALUL',
  'reverse pyramid, same answer KEK',
  'no pyramids, either way up Sadge',
  'blocked, upside down LULW',
  'gravity denied ThatsBait',
  'nice try, inverted is still a pyramid Susge',
  'flipped and still blocked NOIDONTTHINKSO'
]

// walk each list so the same message never goes out twice in a row - twitch drops
// a duplicate sent too soon after the last one
function cycler(messages: string[]): () => string {
  let i = Math.floor(Math.random() * messages.length)
  return () => {
    i = (i + 1) % messages.length
    return messages[i]
  }
}
const nextBlockMessage = cycler(blockMessages)
const nextInvertedMessage = cycler(invertedMessages)

// Chatters pad messages to dodge twitch's duplicate filter. Two families matter:
// format characters (U+034F is the common one) and characters that simply render
// blank - braille blank and the hangul fillers, which chatterino/7tv users paste.
const INVISIBLE = /[­͏؜ᅟᅠ឴឵᠎​-‏‪-‮⁠-⁤⁦-⁯⠀ㅤ﻿ﾠ]|\uDB40[\uDC00-\uDC7F]/g

// A pyramid row is some unit repeated. The unit is usually one emote but can be
// several ("TriHard weLive TriHard weLive" is 2 of "TriHard weLive"), so take the
// shortest slice the whole row is built from.
function parseRepeat(msg: string): { token: string, count: number } | null {
  const parts = msg.normalize('NFKC').replace(INVISIBLE, ' ').trim().split(/\s+/).filter(Boolean)
  if(parts.length === 0) return null

  for(let size = 1; size <= parts.length; size++){
    if(parts.length % size !== 0) continue
    if(parts.every((p, i) => p === parts[i % size]))
      return { token: parts.slice(0, size).join(' '), count: parts.length / size }
  }
  return null
}

// Turns raw unit counts into row heights, or null if this can no longer be a
// pyramid. Rows may be more than one unit wide (2,4,6,4,2 is a pyramid built two
// emotes at a time), so everything is measured in whole base rows.
function pyramidShape(counts: number[]): { rows: number[], inverted: boolean } | null {
  if(counts[0] < 1) return null
  if(counts.length === 1) return { rows: [1], inverted: false }

  const inverted = counts[1] < counts[0]
  const unit = inverted ? counts[0] - counts[1] : counts[0]
  if(unit < 1) return null
  if(counts.some(c => c % unit !== 0)) return null
  const rows = counts.map(c => c / unit)

  if(inverted){
    // starts at the top and only ever comes down, one row at a time
    if(rows[0] < MIN_PYRAMID_HEIGHT) return null
    if(!rows.every((r, i) => i === 0 || r === rows[i-1] - 1)) return null
    return { rows, inverted }
  }

  if(rows[0] !== 1) return null
  let goingUp = true, plateauUsed = false
  for(let i = 1; i < rows.length; i++){
    const step = rows[i] - rows[i-1]
    if(goingUp && step === 1) continue
    if(goingUp && step === 0 && !plateauUsed){ plateauUsed = true; continue } // doubled peak row
    if(step === -1){ goingUp = false; continue }
    return null
  }
  return { rows, inverted }
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

  const shape = pyramidShape(counts)
  if(!shape){
    // dead as a pyramid, but this row can still be the base of the next one
    attempts.set(channel, { user, token: repeat.token, counts: [repeat.count], updatedAt: now })
    return
  }

  const { rows, inverted } = shape
  const current = rows[rows.length - 1]
  const descending = rows.length > 1 && current < rows[rows.length - 2]
  const peak = Math.max(...rows)

  // one row away from finishing: tall enough, and they're back down to 2
  if(descending && current === 2 && peak >= MIN_PYRAMID_HEIGHT){
    // OWNER is exempt everywhere except his own channel, so he can still test there
    if(user !== OWNER || channelName(channel) === OWNER_CHANNEL)
      chatClient.say(channel, `@${user} ${inverted ? nextInvertedMessage() : nextBlockMessage()}`)
    attempts.delete(channel)
    return
  }

  attempts.set(channel, { user, token: repeat.token, counts, updatedAt: now })
}

export function onStreamerOnline(channel: string){ //TODO
}
export function onStreamerOffline(channel: string){ //TODO
}
