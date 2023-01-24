const TelegramBot = require('node-telegram-bot-api');
const Browser = require('./browser');

const token = '';
const bot = new TelegramBot(token, {polling: true});


bot.on('message', async(msg) => {
  const chatId = msg.chat.id;

  if(msg.text == '/start' || msg.text == '/help') {
    bot.sendMessage(chatId, 'Enter your start point, destination point and desired date in the following format format: "Berlin, Frankfurt, 01.03.2023"')
    return
  }

  let splitMessage = msg.text.split(",");
  let origin = splitMessage[0].trim();
  let destination = splitMessage[1].trim();
  let date = splitMessage[2].trim();

  try {
    const tickets = await Browser.getTickets(destination, origin, date);
    let answer = '';

    for (let i = 0; i < tickets.length; i++) {
      let ticket = tickets[i];
      answer += ticket.time + "   " + ticket.duration + "   " + ticket.stops + "   " + ticket.fare + `\n\n`;
    }
    
    if (answer == '') {
      throw new Error();
    }

    bot.sendMessage(chatId, answer);
  }
  catch(e) {
    console.log(e);
    bot.sendMessage(chatId, 'No trains are found');
  }
});