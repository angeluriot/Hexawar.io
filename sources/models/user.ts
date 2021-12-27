import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface UserInterface extends mongoose.Document
{
	username: string;
	hashed_password: string;
	nickname: string;
	color: string;
	admin: boolean;
	skin_id: number;
	skins: number[];
	xp_level: number;
	xp: number;
	games_played: number;
	conquered_lands: number;
	highest_score: number;
	total_score: number;
}

const user_schema = new Schema(
{
	username: {
		type: String,
		index: true,
		unique: true,
		required: true
	},
	hashed_password: {
		type: String,
		required: true
	},
	nickname: {
		type: String,
		default: ''
	},
	color: {
		type: String,
		default: ''
	},
	admin: {
		type: Boolean,
		default: false
	},
	skin_id: {
		type: Number,
		default: -1
	},
	skins: {
		type: [Number],
		default: []
	},
	xp_level: {
		type: Number,
		default: 1
	},
	xp: {
		type: Number,
		default: 0
	},
	games_played: {
		type: Number,
		default: 0
	},
	conquered_lands: {
		type: Number,
		default: 0
	},
	highest_score: {
		type: Number,
		default: 0
	},
	total_score: {
		type: Number,
		default: 0
	}
}, { timestamps: true });

export const User = mongoose.model('User', user_schema);
