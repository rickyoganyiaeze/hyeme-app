const Chat = require('../models/Chat');
const Group = require('../models/Group');

exports.createGroup = async (req, res, next) => {
    try {
        const { name, participants } = req.body;
        
        const chat = await Chat.create({
            participants: [req.user._id, ...participants],
            isGroupChat: true,
            groupName: name,
            lastMessage: { content: 'Group created', sender: req.user._id }
        });

        await Group.create({
            chatId: chat._id,
            name,
            owners: [req.user._id],
            members: [req.user._id, ...participants]
        });

        res.status(201).json(chat);
    } catch (error) { next(error); }
};

exports.addMember = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.groupId);
        
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (!group.owners.includes(req.user._id)) return res.status(401).json({ message: 'Only owners can add members' });

        group.members.push(userId);
        await group.save();

        await Chat.findByIdAndUpdate(group.chatId, { $push: { participants: userId } });
        res.status(200).json({ message: 'Member added' });
    } catch (error) { next(error); }
};

exports.updatePermissions = async (req, res, next) => {
    try {
        const { whoCanSendMessages, whoCanAddMembers } = req.body;
        const group = await Group.findById(req.params.groupId);
        
        if (!group.owners.includes(req.user._id)) return res.status(401).json({ message: 'Only owners can change permissions' });

        if (whoCanSendMessages) group.permissions.whoCanSendMessages = whoCanSendMessages;
        if (whoCanAddMembers) group.permissions.whoCanAddMembers = whoCanAddMembers;

        await group.save();
        res.status(200).json({ message: 'Permissions updated', group });
    } catch (error) { next(error); }
};