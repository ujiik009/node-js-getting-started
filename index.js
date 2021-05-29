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

  const {ACTION,COIN} = req.body

  // SEND LINE NOTIFY
  const message_notify = await axios.post(
    "https://notify-api.line.me/api/notify",
    qs.stringify({
      message: `\nCOIN : ${req.body.COIN}USDT\nACTION : ${req.body.ACTION} `,
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

  res.status(200).json(req.body)
})

app.get("/my/balance", async (req, res) => {
  console.log("DOGE",await check_coin_balance("DOGE")); 
  console.log("USDT",await check_coin_balance("USDT")); 

  res.send("OK") 
})


var server = app.listen(PORT, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})