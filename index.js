const express = require('express')
var app = express();
var cors = require('cors')
const path = require('path')
const PORT = process.env.PORT || 80
const line_token = "4RyIMlkG71klyq3wM4zbAdLB86SRNTo7jf9EzxYFqq9"
const axios = require("axios")
const qs = require("querystring");
app.use(cors())
var bodyParser = require('body-parser');

// binance info
var binance_api_key = "Cvd9DVxoSiHmcWKz7KrEVFXJ6Ylzy3mG4gqLz4B9TOlOBxu755NMdeWED1yjsPac"
var binance_secret_key = "6tny6Jsdj7I0YiYqpKsb5UZI9tRKI2HDly7GyNzry2FQu2hfMp9jvGUYrNK7iwk4"
const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: binance_api_key,
  APISECRET: binance_secret_key,
  useServerTime: true,
  recvWindow: 60000, // Set a higher recvWindow to increase response timeout
  verbose: true, // Add extra output when subscribing to WebSockets, etc
  log: log => {
    console.log(log); // You can create your own logger here, or disable console output
  }
});


function check_coin_balance(coin) {
  return new Promise(async (r, j) => {
    await binance.useServerTime();
    binance.balance((error, balances) => {
      if (error) return console.error(error);
      r(balances[coin].available)
    });
  })
}

async function send_line(message) {
  const message_notify = await axios.post(
    "https://notify-api.line.me/api/notify",
    qs.stringify({
      message: message,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${line_token}`,
      },
    }
  );

  if (message_notify.data.status != 200) {
    console.log(new Date(), "Can not Send to LINE notify", req.body);
  }
}

// parse application/json
app.use(bodyParser.json())


app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.status(200).json({
    status: true,
    message: "Service is Working"
  })
})

app.post("/webhook", async (req, res) => {
  console.log(req.body);

  const { ACTION, COIN } = req.body
  var symbol = `${COIN}USDT`
  switch (ACTION) {
    case "BUY": {

      // have to check balance USDT
      var usdt_balance = await check_coin_balance("USDT")

      // get price of coin
      var coin_price = await binance.prices(symbol)

      var qty = Math.floor(((Number(usdt_balance) / Number(coin_price[symbol]))))
    
      try {
        await binance.marketBuy(symbol, qty);
        console.log(new Date(), "BUY ORDER SUCCESSFULY");
        await send_line(`\n 💚💚Buy Order💚💚 : ${symbol}\n Amount : ${qty} coin\n Price : ${coin_price[symbol]}`)
      } catch (error) {
        console.log(error, usdt_balance, qty);
        await send_line(`\n Can not Buy Order on ${qty}`)
      }

      break;
    }
    case "SELL": {
      // have to check balance USDT
      var doge_balance = await check_coin_balance("DOGE")


      // get price of coin
      var coin_price = await binance.prices(symbol)
      var qty = Math.floor(doge_balance)
     
      try {
        await binance.marketSell(symbol, qty);
        console.log(new Date(), "SELL ORDER SUCCESSFULY");
        await send_line(`\n ❤️❤️SELL Order❤️❤️ : ${symbol}\n Amount : ${qty} coin\n Price : ${coin_price[symbol]}`)
      } catch (error) {
        console.log(error, doge_balance, qty);
        await send_line(`\n Can not Sell Order on ${qty}`)
      }
      break;
    }
    default:
      break;
  }


  res.status(200).json(req.body)
})

app.get("/my/balance", async (req, res) => {
  console.log("DOGE", await check_coin_balance("DOGE"));
  console.log("USDT", await check_coin_balance("USDT"));

  res.send("OK")
})


var server = app.listen(PORT, async function () {
  var host = server.address().address
  var port = server.address().port
  await send_line("Trading Working!!! 🐳🐳🐳")
  console.log("Example app listening at http://%s:%s", host, port)

})