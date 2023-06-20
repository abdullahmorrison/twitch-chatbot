require('dotenv').config();

const tmi = require('tmi.js');

const opts = {
  identity: {
    username: 'abdullahmorrison',
    password: 'oauth:'+process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [
    'abudullahmorrison'
  ]
};

const client = new tmi.client(opts);

// client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onConnectedHandler (addr, port) {
  createPyramid('Lemon ', 3);
}

function createPyramid(emote, pyramidSize){
  for(let i = 0; i < pyramidSize; i++) {
    let message = emote;
    for(let j = 0; j < i; j++) {
      message += emote;
    }
    setTimeout(() => {
      client.say(opts.channels[0], message);
    }, 1000 * i);
  }
  for(let i = pyramidSize; i >= 0; i--) {
    let message = emote;
    for(let j = 0; j < i; j++) {
      message += emote;
    }
    setTimeout(() => {
      client.say(opts.channels[0], message);
    }, 1000 * i);
  }
}