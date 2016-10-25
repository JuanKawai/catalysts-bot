var restify = require('restify');
var builder = require('botbuilder');
var cheerio = require('cheerio');
var request = require('request');
var PDFParser = require('pdf2json');
var textract = require('textract');


//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var intents = new builder.IntentDialog();

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', intents);

intents.matches(/^rk/i, [
    function (session) {
        menu_rk(function(result) { 
        	session.send(result); 
        });
    }
]);

intents.matches(/^gkk/i, [
    function (session) {
        menu_gkk(function(result) { 
        	session.send(result); 
        });
    }
]);

intents.matches(/^eiserne hand/i, [
    function (session) {
        menu_eisernehand(function(result) { 
        	session.send(result); 
        });
    }
]);

intents.matches(/^all/i, [
    function (session) {
		//TODO maybe reuse other dialogs 
		
        menu_eisernehand(function(result) { 
        	session.send(result); 
        });
		
		menu_gkk(function(result) { 
        	session.send(result); 
        });
		
		menu_rk(function(result) { 
        	session.send(result); 
        });
    }
]);

intents.onDefault([
    function (session, args, next) {
        session.send("I know about: rk, eiserne hand, gkk.\n\nTeach me more here: <github>");
    }
]);

//parse the rk menu
function menu_rk(callback) {
    var url = 'http://www.mandis-kantine.at/men1908-23082013';

    request(url, function(error, response, html) {
        if (!error) {
            var day = new Date().getDay();
            var row = day + 4; //thats just how their table is laid out
            //console.log("date: " + day + "; row: " + row);

            var $ = cheerio.load(html);
            var result = $(`#pagetext > table > tbody > tr:nth-child(${row})`).text().replace(/\r\n\s*/g, '\n').trim();
            //console.log(result);
            callback("**RK**\n\n" + result);
        }
    })
}

//parse eiserne hand menu
function menu_eisernehand(callback) {
    var url = 'https://manager.yamigoo.com/public/weekly-menu/html/25';

    request(url, function(error, response, html) {

    	var day = new Date().getDay();
    	if (day < 1 || day > 5) {
    		console.log("no menu today");
    		callback("no menu today");
    		return;
    	} 

        if (!error) {
            var $ = cheerio.load(html);
            var result = $(`#content > div.row > div > div.weeklymenu > div:nth-child(${day})`).text().replace(/\n\s*/g, '\n').trim();
            callback("**Eiserne Hand**\n\n" + result);
        }
    })
}

function menu_lack(callback) {
	var url = 'http://www.fleischerei-lackinger.at/lackinger/speiseplan/aktuellerspeiseplan';

	request(url, function(error, response, html) {
		if (!error) {
			
		}
	})
}

function menu_gkk(callback) {
	var url = 'http://www.caseli.at/content/download/1363/6617/file/Speiseplan_O%C3%96_GKK_Hauptstelle.pdf'
	
	textract.fromUrl(url, function(error, text) {
		if (error) {
			console.log(error);
			callback(error);
			return;
		} else {
			var day = new Date().getDay();
			if (day < 1 || day > 5) {
				console.log("no menu today");
				callback("no menu today");
				return;
			} 
			
			var results = text.split(/(MONTAG|DIENSTAG|MITTWOCH|DONNERSTAG|FREITAG)/)
			
			/*
			 0...empty
			 1...MONTAG
			 2...<monday menu>
			 3...DIENSTAG
			 4...<tuesday menu>
			 5...WEDNESDAY
			 6...<wednesday menu>
			 7...THURSDAY
			 8...<thursday menu>
			 9...FRIDAY
			 10..<friday menu>
			 
			 Monday  -> day==1 --> day+day==2 --> monday menu
			 Tuesday -> day==2 --> day+day==4 --> tuesday menu
			 */
			var index = day+day; 
						
			var menu = results[index].trim().replace(/Classic/g, "\n\nClassic").replace(/^, /g, "");
			//console.log(results[index]);
			callback("**GKK**\n\n" + menu);
		}
	})
	
}