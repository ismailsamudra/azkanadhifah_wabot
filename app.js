const { Client , MessageMedia , LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors')
const { body, validationResult } = require('express-validator');
const http = require('http');
const fs = require('fs');
const { phoneNumberFormatter } = require('./formatter');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const port = process.env.PORT || 3000;
const app = express();
const bodyParser = require('body-parser');
const server = http.createServer(app);
const jsonParser = bodyParser.json()
// var io = require('socket.io')(server);
// const { resolve, resolve6 } = require('dns/promises');
// const { exit } = require('process');
// const { ok } = require('assert');
/**==============================================================
 * FUNCTION TIME START
 ===============================================================*/
TZ = "Asia/Makassar";
let timestamp = new Date().getTime();
let new_date = new Date();
let realtime = date("%Y%m%d%H%M%S");
function date(fstr) {
  let date = new Date();
  return fstr.replace (/%[YmdHMS]/g, function (m) {
    switch (m) {
    case '%Y': return date['getFullYear'] ();
    case '%m': m = 1 + date['getMonth'] (); break;
    case '%d': m = date['getDate'] (); break;
    case '%H': m = date['getHours'] (); break;
    case '%M': m = date['getMinutes'] (); break;
    case '%S': m = date['getSeconds'] (); break;
    default: return m.slice (1);
    }
    return ('0' + m).slice (-2);
  });
}
/* date("%Y-%m-%d %H:%M:%S")
 returns "2012-05-18 05:37:21" */
//  setInterval(cek,1000);
//  function cek(){
//     console.log(date("%d-%m-%Y %H:%M:%S"));
//  }
/**==============================================================
 * FUNCTION TIME END
 ===============================================================*/
/**==============================================================
 * JSON DB START
 ===============================================================*/
const API_KEY = './api-key.json';
api = (fs.existsSync(API_KEY))?require(API_KEY):'';
let api_key = api.key;
const BASE_URL = './base.json';
base = (fs.existsSync(BASE_URL))?require(BASE_URL):'';
let base_url = base.url;
/**==============================================================
 * JSON DB END
 ===============================================================*/
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload({
  debug: false
}));
app.use(cors())
const checkRegisteredNumber = async function(number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
}
// HTTP STATUS INFO
// 200 = TRUE
// 420 = No.Hp Belum terdaftar Whatsapp
// 421 = API-KEY-SALAH
// 500 = Endpoint not Ready
// 501 = DEVICE NO INTERNET
// else = Server Endpoint Error
//====================================================================================
//---------------------------------------------
const client = new Client({
  authStrategy: new LocalAuth(),
  restartOnAuthFail: true,
  puppeteer: { 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ]
   }
});
//---------------------------------------------

client.initialize();

let status = "NOT READY";
let qrcode_return = null;

/**==============================================================
 * APP EXPRESS START
 ===============================================================*/
 let inc;
//---------------------------------------------
app.get("/getChat", async (req, res) => {
  let chats = await client.getChats();
  //console.log(chats);
  let final = [];
  for (const chat of chats) {
      let pesan = await chat.fetchMessages({limit : 50});
      let response = JSON.stringify(pesan);
      let r = JSON.parse(response);
      final.push(r);
  }
  res.status(200).json({
    status: true,
    response: final
  });
});
//---------------------------------------------
//---------------------------------------------
app.get("/qr", (req, res) => {
  res.status(200).json({
      status: true,
      msg: "mendapatkan qr",
      data: {
          qr: qrcode_return
      }
  });
});
//---------------------------------------------
//---------------------------------------------
app.get("/me_data", (req, res) => {
  inc = (client.info)?client.info:false;
  if(inc){
    nomor = inc.wid.user;
    res.status(200).json({
        name:inc.pushname,
        number: nomor.replace('62','0')
    });
  }else{
    res.status(200).json({
        name:"",
        number:""
    });
  }
});
//---------------------------------------------
//---------------------------------------------
app.get("/status", (req, res) => {
  if(status=='READY'){
    res.status(200).json({
      status: true,
      msg: status,
      data: {}
    });
  }else if(status=='DEVICE NO INTERNET'){
    res.status(501).json({
      status: true,
      msg: status,
      data: {}
    });
  }else{
    res.status(201).json({
      status: true,
      msg: status,
      data: {}
    });
  }
});
//---------------------------------------------
// =================================================================
app.post("/callback", jsonParser, [
  body('token').notEmpty(),
  body('url').notEmpty(),
], async (req, res) => {
    const token_auth = req.body.token;
    if(api_key == token_auth){
      base_url =req.body.url
      fs.writeFile(BASE_URL, '{"url":"'+req.body.url+'"}', function (err) {
          if (err) {
              console.error(err);
          }
      });
          res.status(200).json({
            status: true,
            msg:"Berhasil",
            data:{}
          });
        console.log('CALLBACK SERVER SAVE');
      }else{
        res.status(421).json({
          status: false,
          msg:"API-KEY-SALAH",
          data:{}
        });
    }
});
// =================================================================
// =================================================================
app.post("/logout", jsonParser, [
  body('token').notEmpty(),
], async (req, res) => {
    const token_auth = req.body.token;
    if(api_key == token_auth){
      status="NOT READY";
      await client.logout().then(()=>{
        client.initialize();
      });
      res.status(200).json({
         status: true,
         msg:"Berhasil Keluar",
         data:{}
       });
      }else{
        return res.status(421).json({
          status: false,
          msg: 'API-KEY-SALAH',
          data: {}
        });
    }
});
// =================================================================
// Send MEDIA START ================================================
app.post('/send-media', jsonParser, async (req, res) => {
  const number = phoneNumberFormatter(req.body.number);
  const caption = req.body.caption;
  const file = req.body.file;
  const token = req.body.token;
    //==== CEK READY
    a0 = cek_ready(res);
    if(a0){return a0;}
    // //==== CEK ERROR
    // if(!errors.isEmpty()){er = cek_error(res);return er;}
    //==== CEK NO WA
    const isRegisteredNumber = await checkRegisteredNumber(number);
    if(!isRegisteredNumber){dt = res_nomor(res);return dt;}  
    //==== CEK API KEY
    a1 = cek_apikey(token,res);
    if(a1){return a1;}
  // const media = MessageMedia.fromFilePath('./image-example.png');
  // const file = req.files.file;
  // const media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name);
  let mimetype;
  const attachment = await axios.get(base_url+'file/wa_media/'+file, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  client.sendMessage(number, media, {
    caption: caption
  }).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});
// Send MEDIA END =================================================
// Send message ===================================================
app.post('/send', jsonParser, [
  body('number').notEmpty(),
  body('message').notEmpty(),
  body('token').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;
  const token = req.body.token;

     //==== CEK READY
     a0 = cek_ready(res);
     if(a0){return a0;}
     //==== CEK ERROR
     if(!errors.isEmpty()){er = cek_error(res);return er;}
     //==== CEK NO WA
     const isRegisteredNumber = await checkRegisteredNumber(number);
     if(!isRegisteredNumber){dt = res_nomor(res);return dt;}  
     //==== CEK API KEY
     a1 = cek_apikey(token,res);
     if(a1){return a1;}
     //==== KIRIM PESAN
     kirim(number, message,res);
});
// END LINE =====================================================
/**==============================================================
 * APP EXPRESS END
 ===============================================================*/
/**==============================================================
 * CLIENT WHATSAPP START
 ===============================================================*/
//---------------------------------------------
client.on('qr', (qr) => {
  qrcode_return = qr;
  console.log('QR RECEIVED', '200');
});
//---------------------------------------------
//---------------------------------------------
client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});
//---------------------------------------------
//---------------------------------------------
client.on('auth_failure', msg => {
  // Fired if session restore was unsuccessful
  console.error('AUTHENTICATION FAILURE', msg);
  client.initialize();
  status = "NOT READY";
});
//---------------------------------------------
//---------------------------------------------
client.on('ready', () => {
  status = "READY";
  console.log('READY');
});
//---------------------------------------------
//---------------------------------------------
client.on('message', message  => {
  // console.log(message.body);
  let from = message.from;
  let msg = message.body;
  let id_pesan = message.id;
  axios
  .post(base_url+'whatsapp/auth_reply', {
  nomor: from,
  pesan: msg,
  id_pesan: id_pesan
  })
  .then(res => {
  // console.log(`statusCode: ${res.statusCode}`)
  // console.log(res)
  })
  .catch(error => {
  // console.error(error)
  });
});
//---------------------------------------------
//---------------------------------------------
client.on('change_state', state => {
  console.log('CHANGE STATE', state );
});
//---------------------------------------------
//---------------------------------------------
client.on('disconnected', (reason) => {
  console.log('Client was logged out', reason);
  status = "NOT READY";
  client.initialize();
});
//---------------------------------------------
/**==============================================================
 * CLIENT WHATSAPP END
 ===============================================================*/
server.listen(port, function() {
  console.log('App running on Port : ' + port);
});
// /*Interval*/
let cek_server = base_url+"whatsapp/auth_broadcast"; 
setInterval(function() {
  axios
  .get(cek_server);
  // console.log(cek_server+' = is ok 200');
},1000);
//#############################################
function cek_ready(res){
  if(status == "NOT READY"){
    dt = res.status(500).json({
        status: false,
        msg: 'Whatsapp is not ready',
        data: {}
    });
    return dt;
  }
}
//#############################################
//#############################################
function cek_error(res){
  dt = res.status(422).json({
      status: false,
      msg: errors.mapped(),
      data: {}
    });
  return dt;
}
//#############################################
//#############################################
function cek_apikey(token,res){
  if (api_key!=token) {
     dt = res.status(421).json({
      status: false,
      msg: 'API-KEY-SALAH',
      data: {}
      });
      return dt;
  }
}
//#############################################
//#############################################
function res_nomor(res){
    dt = res.status(420).json({
      status: false,
      msg: 'The number is not registered',
      data: {}
    });
    return dt;
}
//#############################################
//#############################################
function state(val){
  client.getState().then((res) => { 
    return (res==val)?true:false;
  });
}
//#############################################
//#############################################
function kirim(no,msg,res){
  client.sendMessage(no, msg).then(response => {
  res.status(200).json({
      status: true,
      msg: "Terkirim",
      data: {response}
    });
  }).catch(err => {
   res.status(500).json({
      status: false,
      msg: "Gagal terkirim",
      data: {err}
    });
  });
}
//#############################################