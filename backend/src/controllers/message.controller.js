import User from "../models/user.model.js"
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js"


export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id
        const filtereUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")
        res.status(200).json(filtereUsers)

    } catch (error) {
        console.log("Error in getUsersForSidebar:", error.message)
        res.status(500).json({ error: "Internal Server error" })

    }

}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id

        const messages = await MessageChannel.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages controller", error.message)
        res.status(500).json({ error: "Internal server error" })

    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const { id: receiverId } = req.params

        const senderId = req.user._id

        let imageUrl
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save()

        // socket

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage controller", error.message)
        res.status(500).json({ error: "Internal server error" })

    }
} 