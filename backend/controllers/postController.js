import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Notification from "../models/notificationModal.js";
import {v2 as cloudinary} from "cloudinary";

export const createPost = async (req, res) => {
	try {
		const {text} = req.body
		let {img} = req.body
		const userId = req.user._id
		const user = await User.findOne({_id: userId})
		if (!user) {
			return res.status(404).json({message: 'User not found'})
		}
		if (!text && !img) {
		return res.status(400).json({message: 'Please provide text or image'})
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img)
			img = uploadedResponse.secure_url
		}

		const newPost = new Post({text, img, user: userId})
		await newPost.save()
		res.status(201).json({message: 'Post created successfully'})
	} catch (err) {
		console.log('error in createPost: ', err.message)
		res.status(500).json({error: 'Internal server error'})
	}
}

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) {
			return res.status(404).json({message: 'Post not found'})
		}
		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({message: 'Unauthorized'})
		}
		if (post.img) {
			const imgId = post.img.split('/').pop().split('.')[0]
			await cloudinary.uploader.destroy(imgId)
		}
		await Post.findByIdAndDelete(req.params.id)
		res.status(200).json({message: 'Post deleted successfully'})
	} catch (err) {
		console.log('error in deletePost: ', err.message)
		res.status(500).json({error: 'Internal server error'})
	}
}

export const commentOnPost = async (req, res) => {

	try {
		const {text} = req.body
		const postId = req.params.id
		const userId = req.user._id


		if (!text) {
			return res.status(400).json({message: 'Please provide text'})
		}
		const post = await Post.findById(postId)
		if (!post) {
			return res.status(404).json({message: 'Post not found'})
		}
		const newComment = {
			text,
			user: userId
		}
		post.comments.push(newComment)
		await post.save()

		res.status(200).json({message: 'Comment added successfully'})
	} catch (err) {
		console.log('error in commentOnPost: ', err.message)
		res.status(500).json({error: 'Internal server error'})
	}
}

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id
		const postId = req.params.id
		const post = await Post.findById(postId)
		const user = await User.findById(userId)
		if (!post) {
			return res.status(404).json({message: 'Post not found'})
		}
		const userLikedPost = post.likes.includes(userId)
		if (userLikedPost) {
			//unlike post
			await post.updateOne({$pull: {likes: userId}})
			await user.updateOne({$pull: {likedPosts: postId}})
			const updatedLikes = post.likes.filter((like) => like.toString() !== userId.toString())
			res.status(200).json(updatedLikes)
		} else {
			//like post
			await post.updateOne({$push: {likes: userId}})
			await user.updateOne({$push: {likedPosts: postId}})
			await post.save()
			const notification = new Notification({
				from: userId,
				to: post.user,
				type: 'like'
			})
			await notification.save()
			const updatedLikes = post.likes
			res.status(200).json(updatedLikes)
		}
	} catch (err) {
		console.log('error in likeUnlikePost: ', err.message)
		res.status(500).json({error: 'Internal server error'})
	}
}

export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find().sort({createdAt: -1}).populate({
			path: 'user',
			select: '-password'
		}).populate({
			path: 'comments.user',
			select: '-password'
		})
		if (posts.length === 0) {
			return res.status(200).json([])
		}
		res.status(200).json(posts)
	} catch (err) {
		console.log('error in getAllPosts: ', err.message)
		res.status(500).json({error: 'Internal server error'})
	}
}

export const getLikedPosts = async (req, res) => {
	const userId = req.params.id
	try {
		const user = await User.findById(userId)
		if (!user) {
			return res.status(404).json({message: 'User not found'})
		}
		const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
			path: 'user',
			select: '-password'
		}).populate({
			path: 'comments.user',
			select: '-password'
		})

		res.status(200).json(likedPosts)
	} catch (err) {
		console.log('error in getLikedPosts: ', err.message)
		res.status(500).json({error: 'Internal server error'})
	}
}

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id
		const user = await User.findById(userId)
		if (!user) {
			return res.status(404).json({message: 'User not found'})
		}
		const following = user.following
		const feedPosts = await Post.find({user: {$in: following}}).sort({createdAt: -1}).populate({
			path: 'user',
			select: '-password'
		}).populate({
			path: 'comments.user',
			select: '-password'
		})

		res.status(200).json(feedPosts)
	} catch (err) {
		console.log('error in getFollowingPosts: ', err.message)
		res.status(500).json({error: 'Internal server error'})
	}
}

export const getUserPosts = async(req,res) => {
	const {username} = req.params
	try {
		const user = await User.findOne({username})
		if (!user) {
			return res.status(404).json({message: 'User not found'})
		}
		const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
			path: 'user',
			select: '-password'
		}).populate({
			path: 'comments.user',
			select: '-password'
		})
		res.status(200).json(posts)
	} catch (err) {
		console.log('error in getUserPosts: ', err.message)
		res.status(500).json({error: 'Internal server error'})
	}
}