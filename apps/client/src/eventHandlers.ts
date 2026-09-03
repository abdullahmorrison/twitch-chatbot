import { ChatMessage } from '@twurple/chat'
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

// One in-progress pyramid attempt per channel. Anyone matching the current row
// can carry it on - pyramids get finished collaboratively - but a message that
// isn't the next row kills it.
type Attempt = { rows: string[][], updatedAt: number }
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

const creatorMessages = [
  'I dont block my creator 4Salute',
  'creator privileges Prayge',
  'letting that one through boss tenzinClap',
  'I dont block the guy who wrote me KEK',
  'rules dont apply to the one who made me Okayge',
  'pyramid approved, you built me ImHIM',
  'nice pyramid boss GENIUS',
  'no blocking my own creator OMEGALUL'
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
const nextCreatorMessage = cycler(creatorMessages)

// Chatters pad messages to dodge twitch's duplicate filter, and padding that
// paints nothing still counts as an emote to a naive split. Listing the
// characters to strip is a losing game - there is always one more - so this asks
// the opposite question and drops anything that cannot render: control, format,
// surrogate, private-use and combining codepoints, plus anything UNASSIGNED, so
// padding invented in a future unicode version is covered before it exists.
const NON_RENDERING = /[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Cn}\p{Mn}\p{Me}]/gu

// The leftovers: codepoints in a visible category that still paint nothing.
// Unicode has only a handful, and they do not grow the way format characters do.
const BLANK = /[\u115F\u1160\u2800\u3164\uFFA0]/g

// Twitch puts "@parent " at the front of a reply's body, which turns every row of
// a pyramid into a different unit. Drop it when the tags say this is a reply.
function stripReplyPrefix(text: string, chatMsg?: ChatMessage): string {
  return chatMsg?.isReply ? text.replace(/^@\S+\s+/, '') : text
}

// Removing rather than space-separating matters: padding stuck to an emote with
// no space ("Rime<U+FE0F>") must collapse back onto it, not split it in two.
function tokenize(msg: string): string[] {
  return msg.normalize('NFKC')
    .replace(NON_RENDERING, '')
    .replace(BLANK, '')
    .split(/[\s\p{Z}]+/u)
    .filter(Boolean)
}

// token-for-token prefix
function isPrefix(a: string[], b: string[]): boolean {
  return a.length <= b.length && a.every((t, i) => t === b[i])
}

// Turns the rows so far into row heights, or null if this can no longer be a
// pyramid. The rows do not have to be one emote repeated - what makes a pyramid
// is that each row is the one before it plus a fixed-width step, and on the way
// down the shorter row is a prefix of the taller one. That covers a plain
// "a / a a / a a a", rows built several emotes at a time, and mixed rows like
// "wide / wide Pensive / wide Pensive wide". A repeated row never ends a run, it
// just doesn't advance it.
function pyramidShape(rows: string[][]): { heights: number[], inverted: boolean } | null {
  const lens = rows.map(r => r.length)
  if(lens[0] < 1) return null

  let width = 0
  for(let i = 1; i < rows.length; i++){
    const prev = rows[i-1], cur = rows[i]
    if(cur.length === prev.length){
      if(!isPrefix(cur, prev)) return null // same length, so this means identical
      continue
    }
    const grew = cur.length > prev.length
    if(!isPrefix(grew ? prev : cur, grew ? cur : prev)) return null
    const step = Math.abs(cur.length - prev.length)
    if(width === 0) width = step
    else if(step !== width) return null
  }
  if(width === 0) return { heights: lens.map(() => 1), inverted: false } // nothing but repeats yet
  if(lens.some(l => l % width !== 0)) return null

  const heights = lens.map(l => l / width)

  // direction comes from the first row that actually differs
  let turn = 1
  while(turn < heights.length && heights[turn] === heights[0]) turn++
  const inverted = turn < heights.length && heights[turn] < heights[0]

  if(inverted){
    if(heights[0] < MIN_PYRAMID_HEIGHT) return null
    for(let i = 1; i < heights.length; i++){
      const step = heights[i] - heights[i-1]
      if(step !== 0 && step !== -1) return null
    }
    return { heights, inverted }
  }

  if(heights[0] !== 1) return null
  let goingUp = true
  for(let i = 1; i < heights.length; i++){
    const step = heights[i] - heights[i-1]
    if(step === 0) continue
    if(goingUp && step === 1) continue
    if(step === -1){ goingUp = false; continue }
    return null
  }
  return { heights, inverted }
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
export async function onMessageHandler(channel: string, user: string, raw: string, chatMsg?: ChatMessage) {
  const msg = stripReplyPrefix(raw, chatMsg)
  // answers even while paused - the point is to prove the bot is reachable
  if(user === OWNER && msg === '!heartbeat'){
    chatClient.say(channel, `@${user} MrDestructoid alive, up ${uptime()}, ${paused ? 'PAUSED' : 'watching for pyramids'}`)
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

  const tokens = tokenize(msg)
  if(tokens.length === 0){
    attempts.delete(channel)
    return
  }

  const now = Date.now()
  const existing = attempts.get(channel)
  const continues = existing && now - existing.updatedAt < PYRAMID_TIMEOUT_MS
  const rows = continues ? [...existing!.rows, tokens] : [tokens]

  const shape = pyramidShape(rows)
  if(!shape){
    // dead as a pyramid, but this row can still be the base of the next one
    attempts.set(channel, { rows: [tokens], updatedAt: now })
    return
  }

  const { heights, inverted } = shape
  const current = heights[heights.length - 1]
  const descending = heights.length > 1 && current < heights[heights.length - 2]
  const peak = Math.max(...heights)

  // OWNER is exempt everywhere except his own channel, so he can still test there
  const exempt = user === OWNER && channelName(channel) !== OWNER_CHANNEL
  const tall = peak >= MIN_PYRAMID_HEIGHT

  // one row away from finishing: tall enough, and they're back down to 2.
  // `user` is whoever posted this row, which may not be who started the pyramid.
  if(descending && current === 2 && tall && !exempt){
    chatClient.say(channel, `@${user} ${inverted ? nextInvertedMessage() : nextBlockMessage()}`)
    attempts.delete(channel)
    return
  }

  // OWNER got one all the way down unblocked - let it land, then say so. Speaking
  // any earlier would break the pyramid, which is the point of the exemption.
  if(descending && current === 1 && tall && exempt){
    chatClient.say(channel, `@${user} ${nextCreatorMessage()}`)
    attempts.delete(channel)
    return
  }

  attempts.set(channel, { rows, updatedAt: now })
}

export function onStreamerOnline(channel: string){ //TODO
}
export function onStreamerOffline(channel: string){ //TODO
}
