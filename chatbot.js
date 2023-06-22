require('dotenv').config();

const tmi = require('tmi.js');

const opts = {
  identity: {
    username: 'abdullahmorrison',
    password: 'oauth:'+process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [
    'abdullahmorrison'
  ]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onMessageHandler (target, context, msg, self) {
  if(msg.toLowerCase() === '!lemon') {
    createPyramid('Lemon ', 4);
  }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function createPyramid(emote, pyramidSize){
  let count = 1;
  let down = false
  let interval = setInterval(() => {
    if(count <= pyramidSize && !down){
      client.say('#abdullahmorrison', emote.repeat(count));
      count++;
      if(count === pyramidSize){
        down = true;
      }
    }else if(count > 0 && down){
      client.say('#abdullahmorrison', emote.repeat(count));
      count--;
    }else {
      clearInterval(interval);
    }
  }, 1000);
}