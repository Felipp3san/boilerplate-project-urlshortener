const mongoose = require('mongoose');

require('dotenv').config();

class Database {
	constructor() {
		this._connect();
	}

	_connect() {
		mongoose.connect(process.env.MONGO_URL)
			.then(() => console.log("Database connection successful"))
			.catch((err) => console.log("Database connection failed"));
	}
}

module.exports = new Database();