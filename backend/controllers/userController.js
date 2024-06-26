import User from "../models/userModel.js";
import Notification from "../models/notificationModal.js";
import {v2 as cloudinary} from "cloudinary";
import bcrypt from "bcrypt";

export const getUserProfile = async (req, res) => {
	const {username} = req.params

	try {
		const user = await User.findOne({username}).select('-password')
		if (!user) {
			return res.status(404).json({message: 'User not found'})
		}
		return res.status(200).json(user)
	} catch (err) {
		console.log('error in getUserProfile')
		res.status(500).json({message: err.message})
	}
}

export const followUnfollowUser = async (req, res) => {

	try {
		const {id} = req.params
		const userToModify = await User.findById(id)
		const currentUser = await User.findById(req.user._id)
		if (id === req.user._id.toString()) {
			return res.status(400).json({error: 'You cannot follow/unfollow yourself'})
		}
		if (!userToModify || !currentUser) {
			return res.status(404).json({message: 'User not found'})
		}
		const isFollowing = currentUser.following.includes(id)

		if (isFollowing) {
			await currentUser.updateOne({$pull: {following: id}})
			await userToModify.updateOne({$pull: {followers: req.user._id}})

			res.status(200).json({message: 'User unfollowed successfully'})
		} else {
			await currentUser.updateOne({$push: {following: id}})
			await userToModify.updateOne({$push: {followers: req.user._id}})
			const newNotification = new Notification({
				from: req.user._id,
				to: userToModify._id,
				type: "follow",
			})
			await newNotification.save()

			res.status(200).json({message: 'User followed successfully'})
		}


	} catch (err) {
		console.log('error in followUnfollowUser')
		res.status(500).json({message: err.message})
	}
}

export const getSuggestedUsers = async (req, res) => {

	try {
		const userId = req.user._id
		const usersFollowedByMe = await User.findById(userId).select('following')
		const users = await User.aggregate([
			{
				$match: {
					_id: {
						$ne: userId
					}
				}
			},
			{
				$sample: {size: 10}
			}
		])
		const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id))
		const suggestedUsers = filteredUsers.slice(0, 4)
		suggestedUsers.forEach(user => user.password = null)
		return res.status(200).json(suggestedUsers)
	} catch (err) {
		console.log('error in getSuggestedUsers', err.message)
		res.status(500).json({message: err.message})
	}
}

export const updateUser = async (req, res) => {
	const {username, email, fullName,  currentPassword, newPassword, bio, link} = req.body
	let {profileImg, coverImg} = req.body
	const userId = req.user._id
	try {
		const user = await User.findById(userId)

		if (!user) {
			return res.status(404).json({message: 'User not found'})
		}
		if ((newPassword && !currentPassword) || (currentPassword && !newPassword)) {
			return res.status(400).json({message: 'Please provide both current and new password'})

		}
		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password)
			if (!isMatch) {
				return res.status(400).json({message: 'Incorrect current password'})
			}
			if (newPassword.length < 6) {
				return res.status(400).json({message: 'Password must be at least 6 characters long'})
			}
			const salt = await bcrypt.genSalt(10)
			user.password = await bcrypt.hash(newPassword, salt)
		}
		if (profileImg) {
			if(user.profileImg){
				const imageId = user.profileImg.split('/').pop().split('.')[0]
				await cloudinary.uploader.destroy(imageId)
			}
			const uploadResponse = await cloudinary.uploader.upload(profileImg)
			profileImg = uploadResponse.secure_url
		}
		if (coverImg) {
			if(user.coverImg){
				const imageId = user.profileImg.split('/').pop().split('.')[0]
				await cloudinary.uploader.destroy(imageId)
			}
			const uploadResponse = await cloudinary.uploader.upload(coverImg)
			coverImg = uploadResponse.secure_url
		}

		user.fullName = fullName || user.fullName
		user.email = email || user.email
		user.username = username || user.username
		user.bio = bio || user.bio
		user.link = link || user.link
		user.profileImg = profileImg || user.profileImg
		user.coverImg = coverImg || user.coverImg

		await user.save()
		user.password = null
		return res.status(200).json(user)
	} catch (err) {
		console.log('error in updateUser', err.message)
		res.status(500).json({message: err.message})
	}

}