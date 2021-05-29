const express = require('express')
var app = express();
var cors = require('cors')
const path = require('path')
const PORT = process.env.PORT || 80

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

app.post("/webhook", (req, res) => {
  console.log(req.body);
  res.status(200).json(req.body)
})


var server = app.listen(PORT, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})