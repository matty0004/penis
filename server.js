var list = require("./allowed.json")

const express = require("express");
const app = express();
const fs = require("fs");

let allowedips = []

app.post('/wdf/v1/assign-room', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
    ip = ip.split(',')[0]
    allowedips.push(ip)
  res.json({"room":"MainJD2018"})
});

app.get('/clear', (req, res) => {
    allowedips = []
    res.send("cleared.")
});

app.get('/addip', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
    ip = ip.split(',')[0]
    allowedips.push(ip)
    res.send("your ip is now allowed.")
});

app.use((req, res, next) => {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
  ip = ip.split(',')[0]
  if (allowedips.includes(ip)) {
    next();
  } else {
    res.sendStatus(405)
  }
})

const party = require("./carousel.json");

var catalog = (object) => {
  var carousel = require("./files/carousel.json")
  for (var categoryTitle in object) {
    var category = {"__class":"Category","title":categoryTitle,"act":"ui_carousel","isc":"grp_row","categoryType":"recommended","items":[{"__class":"Item","isc":"grp_shuffle","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Shuffle"}],"endPos":3,"actionList":"NonStop"}]};
    for (var mapName in object[categoryTitle]) {
      category.items.push({"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":object[categoryTitle][mapName]}],"actionList":"partyMap"});
    }
    carousel.categories.push(category);
  }
  return carousel;
}

app.get("/profile/v2/profiles", (req, res) => {
  var allow = list.allowed[req.query.profileIds]
  if (allow == true){
    res.send({});
  }
  else {
    console.log("unallowed request from: [" + req.query.profileIds + "]")
    res.sendStatus(403)
  }
});


app.post("/carousel/v2/pages/upsell-videos", (request, response) => {
  response.sendFile(`${__dirname}/files/carousel/v2/pages/upsell-videos`);
});
app.post("/carousel/v2/pages/:idk", (request, response) => {
  response.send(catalog(party));
});
app.get("/session-quest/v1/", (request, response) => {
  response.send({"__class":"SessionQuestService::QuestData","newReleases":[]});
});
app.get("/packages/v1/sku-packages", (req, res) => {
  var skuid = req.header("X-SkuId")
  if (skuid == "jd2018-ps4-scea") {
    res.send(require("./platforms/jd2018-ps4-scea/sku-packages.json"))}
  else if (skuid == "jd2018-nx-all") {
    res.send(require("./platforms/jd2018-nx-all/sku-packages.json"))}
});
app.get("/songdb/v1/songs", (req, res) => {
  var skuid = req.header("X-SkuId")
  if (skuid == "jd2018-ps4-scea") {
    res.send(require("./platforms/jd2018-ps4-scea/songdb.json"))}
  else if (skuid == "jd2018-nx-all") {
    res.send(require("./platforms/jd2018-nx-all/songdb.json"))}
});
app.get("/profile/v2/profiles", (request, response) => {
  response.send({});
});
app.post("/profile/v2/profiles", (request, response) => {
  response.send();
});

app.get("/content-authorization/v1/maps/:codename", (request, response) => {
  var codename = request.params.codename;
  console.log("someone is playing " + codename)
  var local = require("./content-authorization/links.json");
  var localcodename = local[codename]
  var lowwebm = localcodename.LOW
  var midwebm = localcodename.MID
  var highwebm = localcodename.HIGH
  var ultrawebm = localcodename.ULTRA
  var audio = localcodename.Audio
  var reswebmsjson = '{"__class":"ContentAuthorizationEntry","duration":300,"changelist":535312,"urls":{"jmcs://jd-contents/' + codename + '/' + codename + '_ULTRA.webm":"' + ultrawebm + '","jmcs://jd-contents/' + codename + '/' + codename + '_ULTRA.hd.webm":"' + ultrawebm + '","jmcs://jd-contents/' + codename + '/' + codename + '_MID.webm":"' + midwebm + '","jmcs://jd-contents/' + codename + '/' + codename + '_MID.hd.webm":"' + midwebm + '","jmcs://jd-contents/' + codename + '/' + codename + '_LOW.webm":"' + lowwebm + '","jmcs://jd-contents/' + codename + '/' + codename + '_LOW.hd.webm":"' + lowwebm + '","jmcs://jd-contents/' + codename + '/' + codename + '_HIGH.webm":"' + highwebm + '","jmcs://jd-contents/' + codename + '/' + codename + '_HIGH.hd.webm":"' + highwebm + '","jmcs://jd-contents/' + codename + '/' + codename + '.ogg":"' + audio + '"}}'
   response.send(JSON.parse(reswebmsjson))
});
app.all("/*", function (req, res) {
    var local = "./files/"+req.originalUrl;
    if (fs.existsSync(local) == true) {
	res.sendFile(`${__dirname}/files`+req.originalUrl)}
	else {
	res.sendStatus(404)}
});
const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});