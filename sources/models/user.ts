import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const user_schema = new Schema(
{
	name: {
		type: String,
		required: true
	},
	skins: {
		type: [Number],
		required: true
	},
	record: {
		type: Number,
		required: false
	}
}, { timestamps: true });

export const User = mongoose.model('User', user_schema);
