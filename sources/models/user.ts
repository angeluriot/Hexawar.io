import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const user_schema = new Schema(
{
	username: {
		type: String,
		required: true
	},
	hashed_password: {
		type: String,
		required: true
	},
	data: {
		type: String,
		required: true
	}
}, { timestamps: true });

export const User = mongoose.model('User', user_schema);
