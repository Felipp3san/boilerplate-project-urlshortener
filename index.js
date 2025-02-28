require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const db = require('./database.js');
const dns = require('dns').promises;
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
		.catch((err) => res.json({"error":"No short URL found for the given input"}));
})

app.post('/api/shorturl', async (req, res) => {

	const { url } = req.body;
	let hostname = "";

	try {
		hostname = new URL(url).hostname;
	}
	catch (err) {
		return res.json({ error: 'Invalid URL'});	
	}

	try {
		await dns.lookup(hostname);
	}
	catch (err) {
		console.log(err);
		return res.json({ error: 'Invalid Hostname'});
	}

	try {
		const doc = await insertHost(url);
		res.json({ original_url: doc.url, short_url: doc.short_url });
	}
	catch (err) {
		console.log(err);
		res.json({ error: 'Failed to store URL in DB'});
	}
})

async function insertHost(url) {
	try {
		let doc = await Host.findOne({ url: url }).exec();	
		if(doc) return doc;

		let newDoc = new Host({
			url: url,	
			short_url: await getHighestShortUrl() + 1
		});

		return await newDoc.save();
	}
	catch (err) {
		throw err;
	}
}

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
