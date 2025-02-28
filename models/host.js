const mongoose = require("mongoose");

const hostSchema = mongoose.Schema({
	url: {
		type: String,
		unique: true
	},
	short_url: {
		type: Number,
		unique: true
	}
})

module.exports = mongoose.model('Host', hostSchema);