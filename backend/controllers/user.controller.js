const User = require('../models/User');
const { emitNotification } = require('../services/socket.service');

exports.completeOnboarding = async (req, res, next) => {
    try {
        const { name, about } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (about) user.about = about;
        
        if (req.file) {
            user.avatar = `/storage/profiles/${req.file.filename}`;
        }
        
        user.isOnboarded = true;
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) { next(error); }
};

exports.searchUsers = async (req, res, next) => {
    try {
        const { query } = req.query;
        
        let filter = { _id: { $ne: req.user._id }, isOnboarded: true };
        
        if (query && query.trim() !== '') {
            filter = {
                _id: { $ne: req.user._id },
                isOnboarded: true,
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { phone: { $regex: query, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(filter).select('name phone avatar about');
        res.status(200).json(users);
    } catch (error) { next(error); }
};

exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-settings -privacy -__v');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) { next(error); }
};

// Get Friend Requests
exports.getFriendRequests = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friendRequests.from', 'name avatar phone');

        const requests = user.friendRequests.filter(r => r.status === 'pending');
        res.status(200).json(requests);
    } catch (error) { next(error); }
};

// Send Connection Request
exports.sendFriendRequest = async (req, res, next) => {
    try {
        const { recipientId } = req.body;
        const senderId = req.user._id;

        if (senderId.toString() === recipientId) {
            return res.status(400).json({ message: "You can't add yourself." });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) return res.status(404).json({ message: 'User not found' });

        // FIX 1: Check if already friends
        if (recipient.friends.includes(senderId)) {
            return res.status(400).json({ message: 'Already friends.' });
        }

        // FIX 2: Only block if there is an EXISTING PENDING request
        const existingPendingRequest = recipient.friendRequests.find(
            r => r.from.toString() === senderId.toString() && r.status === 'pending'
        );
        
        if (existingPendingRequest) {
            return res.status(400).json({ message: 'Request already sent.' });
        }

        // FIX 3: Clean up OLD (declined/accepted) requests so the user can re-request
        recipient.friendRequests = recipient.friendRequests.filter(
            r => r.from.toString() !== senderId.toString()
        );

        // Add the new request
        recipient.friendRequests.push({ from: senderId, status: 'pending' });
        await recipient.save();

        // --- EMIT REAL-TIME NOTIFICATION ---
        const sender = await User.findById(senderId).select('name avatar');
        
        const newRequestData = {
            requestId: recipient.friendRequests[recipient.friendRequests.length - 1]._id,
            from: {
                _id: sender._id,
                name: sender.name,
                avatar: sender.avatar,
                phone: sender.phone
            },
            message: `${sender.name} sent you a connection request!`
        };

        emitNotification(recipientId, 'newFriendRequest', newRequestData);

        res.status(200).json({ message: 'Request sent successfully' });
    } catch (error) { next(error); }
};

// Accept or Decline Request
exports.handleFriendRequest = async (req, res, next) => {
    try {
        const { requestId, action } = req.body; 
        const user = await User.findById(req.user._id);

        const requestIndex = user.friendRequests.findIndex(
            r => r._id.toString() === requestId
        );

        if (requestIndex === -1) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const request = user.friendRequests[requestIndex];

        if (action === 'accept') {
            const sender = await User.findById(request.from);
            
            // Add to friends list
            user.friends.push(request.from);
            sender.friends.push(user._id);
            
            await sender.save();
            
            // Update request status
            user.friendRequests[requestIndex].status = 'accepted';

            // --- NOTIFY THE SENDER ---
            emitNotification(request.from, 'requestAccepted', {
                message: `${user.name} accepted your connection request!`,
                userId: user._id,
                name: user.name,
                avatar: user.avatar
            });
        } else {
            // If declined, remove the request completely so they can try again later
            user.friendRequests.splice(requestIndex, 1);
        }

        await user.save();
        res.status(200).json({ message: `Request ${action}ed` });
    } catch (error) { next(error); }
};

exports.checkRelationship = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const myId = req.user._id;

        const me = await User.findById(myId);
        const target = await User.findById(targetUserId);

        if (!target) return res.status(404).json({ message: 'User not found' });

        const isFriend = me.friends.includes(targetUserId);
        
        // FIX: Only look for PENDING requests
        const sentRequest = target.friendRequests.find(r => r.from.toString() === myId.toString() && r.status === 'pending');
        const receivedRequest = me.friendRequests.find(r => r.from.toString() === targetUserId.toString() && r.status === 'pending');

        let status = 'none'; 
        if (isFriend) status = 'friend';
        else if (sentRequest) status = 'sent';
        else if (receivedRequest) status = 'received';

        res.status(200).json({ status, requestId: receivedRequest?._id });
    } catch (error) { next(error); }
};

// Disconnect / Unfriend User
exports.disconnectUser = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const myId = req.user._id;
        const me = await User.findById(myId);

        if (!userId) return res.status(400).json({ message: 'User ID required' });

        // Remove from friends list
        await User.findByIdAndUpdate(myId, { $pull: { friends: userId } });
        await User.findByIdAndUpdate(userId, { $pull: { friends: myId } });

        // NOTIFY THE OTHER USER
        emitNotification(userId, 'connectionLost', {
            recipientId: myId.toString(),
            recipientName: me.name,
            message: `You are no longer connected with ${me.name}.`
        });

        res.status(200).json({ message: 'Disconnected successfully' });
    } catch (error) {
        next(error);
    }
};