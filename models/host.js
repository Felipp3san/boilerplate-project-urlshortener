const mongoose = require("mongoose");

const hostSchema = mongoose.Schema({
	url: {
		type: String,
		required: true,
		unique: true
	},
	short_url: {
		type: Number,
		required: true,
		unique: true
	}
})

module.exports = mongoose.model('Host', hostSchema);