var express = require("express");
var bodyParser = require("body-parser");
//var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var request = require("request");
//var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models")

var PORT = process.env.port || 3000;

var app = express();

app.use(express.static("public"));

//app.use(logger("dev"));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newsScraper", {
	useMongoClient: true
});

app.get("/", function(req, res, next) {
	db.Article.find(function(error, dbArticles) {
		res.render("index", {title: "Tech News Scraper", contents: dbArticles})
	})
	
})

app.get("/scrape", function(req, res) {
	request("http://gizmodo.com", function(error, response, html) {
		var $ = cheerio.load(html);

		$("h1.headline").each(function(i, element) {
			var title = $(element).children("a").text();
			var link = $(element).children("a").attr("href")
			//console.log(title,link)
			var result = {
				title: title,
				link: link
			}
			console.log(result)
			db.Article.create(result).then(function(dbArticle) {
				res.redirect("/")
			}).catch(function(err) {
				res.json(err)
			})
		})
	})
	//res.send("scrape complete")
});

app.get("/articles", function(req, res) {
	db.Article.find({}).then(function(dbArticle) {
		res.json(dbArticle)
	})
	.catch(function(err) {
		res.json(err)
	})
})

app.get("/articles/:id", function(req, res) {

})

app.post("articles/:id", function(req, res) {

})

app.listen(PORT, function() {
	console.log("App running on port " + PORT)
})