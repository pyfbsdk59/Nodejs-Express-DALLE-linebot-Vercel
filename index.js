const express = require("express");
const line = require('@line/bot-sdk');
const https = require("https")




const app = express();

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))


const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);


const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);



const handleEvent = async (event) => {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    
    const response = await openai.createImage({
      prompt: event.message.text, //人類的提示
      n: 1,
      size: "1024x1024",
    });
    
    let image_url = response.data.data[0].url;  
    console.log(response.data.data[0].url);

    
    //self.image_url = response['data'][0]['url'].strip()
   

    
    return client.replyMessage(event.replyToken, 
      {
        type: 'image',
        originalContentUrl: image_url,
        previewImageUrl: image_url
    }
    )
};




// Webhook listener
app.get('/', (req, res) => {
  res.end('hello!');
});

app.post('/callback', (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))  //handleEvent處理傳過來的訊息再回傳
        .then((result) => res.json(result))
        .catch((err) => {
            res.status(500).end();
        });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
