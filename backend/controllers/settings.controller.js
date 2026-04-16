const User = require('../models/User');

exports.getSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('name about avatar settings privacy');
        res.status(200).json(user);
    } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, about } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (about) user.about = about;
        if (req.file) user.avatar = `/storage/profiles/${req.file.filename}`;

        await user.save();
        res.status(200).json({ message: 'Profile updated', user });
    } catch (error) { next(error); }
};

exports.updateTheme = async (req, res, next) => {
    try {
        const { theme, chatBg } = req.body;
        const user = await User.findById(req.user._id);

        if (theme) user.settings.theme = theme;
        if (chatBg) user.settings.chatBg = chatBg;

        await user.save();
        res.status(200).json({ message: 'Theme updated' });
    } catch (error) { next(error); }
};

exports.updatePrivacy = async (req, res, next) => {
    try {
        const { statusVisibility, anonymousMode, whoCanAddMe } = req.body;
        const user = await User.findById(req.user._id);

        if (statusVisibility) user.privacy.statusVisibility = statusVisibility;
        if (typeof anonymousMode === 'boolean') user.privacy.anonymousMode = anonymousMode;
        if (whoCanAddMe) user.privacy.whoCanAddMe = whoCanAddMe;

        await user.save();
        res.status(200).json({ message: 'Privacy updated' });
    } catch (error) { next(error); }
};