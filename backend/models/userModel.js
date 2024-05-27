import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	fullName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true,
		minLength: 6
	},
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: []
		}
	],
	following: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: []
		}
	],
	profileImg: {
		type: String,
		default: ""
	},
	coverImg: {
		type: String,
		default: ""
	},
	bio: {
		type: String,
		default: ""
	},
	link: {
		type: String,
		default: ""
	},
	likedPosts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			default: []
		}
	],
	notifications: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Notification",
			default: []
		}
	]


}, {timestamps: true});

const User = mongoose.model('User', userSchema)
export default User