require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const db = require('./database.js');
const dns = require('node:dns');
const Host = require('./models/host.js');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:url', (req, res) => {
	Host.findOne({ short_url: req.params.url })
		.then((doc) => res.redirect(doc.url))
		.catch((err) => res.send("Not found"));
})

app.post('/api/shorturl', (req, res) => {

	const { url } = req.body;
	let host;

	try {
		host = new URL(url);
	}
	catch (err) {
		res.json({ error: 'Invalid URL'});	
	}

	dns.lookup(host.hostname, async (err, addr) => {
		if (err) return res.json({ error: 'Invalid Hostname'});

		let highestShortUrl = await getHighestShortUrl();

		let address = new Host({
			url: url,	
			short_url: highestShortUrl + 1
		});

		console.log(address);
		address.save()
			.then((doc) => {
				res.json({ original_url: doc.url, short_url: doc.short_url });	
			})
			.catch((err) => res.json({ error: err }));
	});
})

async function getHighestShortUrl() {
    try {
        const doc = await Host.find().sort({ short_url: -1 }).limit(1).exec();
        let highestValue = doc.length > 0 ? Number(doc[0].short_url) : 0;
        return highestValue;
    } catch (err) {
        console.log(err);
        return 0;
    }
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
