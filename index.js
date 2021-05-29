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

  // SEND LINE NOTIFY
  const message_notify = await axios.post(
    "https://notify-api.line.me/api/notify",
    qs.stringify({
      message: `COIN : ${req.body.COIN}\nACTION : ${req.body.ACTION} `,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${line_token}`,
      },
    }
  );

  if (message_notify.data.status != 200) {
    console.log(new Date(),"Can not Send to LINE notify",req.body);
  } 

  res.status(200).json(req.body)
})


var server = app.listen(PORT, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})