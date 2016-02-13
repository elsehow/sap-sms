'use strict'

var app = require('express')()
  , port = 42001
  , printer_api_key = require('./config.js').printer_key
  , indra_endpoint = 'http://indra.webfactional.com'
  , request = require('request-json')
  , indra_endpoint_client = request.createClient(indra_endpoint)

// format sms JSON from twilio
function format (sms) {
    return `${sms.From} - ${sms.Body}`
}

// format json for printer api
function printer_json (msg) {
    return {
        type: printer_api_key,
        message: msg,
    }
}
// format + async post an SMS to printer api 
function process (sms) {
    let s = format(sms)
    let j = printer_json(s)
    indra_endpoint_client
        .post('/', j, (err, res) => {
            if (err) console.log('ERR', err)})
}

function validate (query) {
  if (query &&
      query.From && 
      query.Body) {
    return true
  }
  return false
}

app.get('/q', function (req,res) {
//if valid twillio request, log
 if (validate(req.query)) {
   process(req.query)
   res.sendStatus(202)
   return
 } 
 res.sendStatus(422)
 return
})  

app.listen(port, () =>  
  console.log('running! on', port))

