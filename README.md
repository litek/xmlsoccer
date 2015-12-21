# XMLSoccer

Promise based client for [XMLSoccer.com](http://www.xmlsoccer.com/FootballData.asmx) based on [node-soap](https://github.com/vpulim/node-soap)

```javascript
const Xmlsoccer = require('xmlsoccer')

let config = {key: 'apikey', demo: true}
let client = new Xmlsoccer(config.key, config.demo)

client.connect().then(function() {
  return client.CheckApiKey()
}).then(function(res) {
  console.log(res)
})
```
