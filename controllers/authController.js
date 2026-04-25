const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account not activated. Please check your email for the activation key.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'safecity_secret_key_2024',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentType: user.departmentType,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, departmentType, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const activationKey = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 char key

    const user = new User({
      name,
      email,
      password, // Bcrypt hashes this automatically via pre-save hook
      role: 'department',
      departmentType,
      address,
      isActive: false,
      activationKey
    });

    await user.save();

    // Send Email via Gmail (Using Env Vars)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'tilvaviraj@gmail.com',
        pass: process.env.GMAIL_PASS || 'vixd ovfa gvtn ucgd',
      },
    });

    let info = await transporter.sendMail({
      from: `"SafeCity System" <${process.env.GMAIL_USER || 'tilvaviraj@gmail.com'}>`,
      to: email,
      subject: "SafeCity Department Activation Key",
      text: `Hello ${name},\n\nYour department account has been created.\nYour activation key is: ${activationKey}\n\nPlease enter this key on the activation page to enable your account.`,
      html: `<h3>Hello ${name},</h3><p>Your department account has been created.</p><p>Your activation key is: <b style="font-size: 24px; color: #dc2626;">${activationKey}</b></p><p>Please enter this key on the activation page to enable your account.</p>`
    });

    res.json({ message: 'Registration successful! Please check your email for the activation key.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.activate = async (req, res) => {
  try {
    const { email, activationKey } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isActive) return res.status(400).json({ message: 'Account is already active' });

    if (user.activationKey !== activationKey.trim().toUpperCase()) {
      return res.status(400).json({ message: 'Invalid activation key' });
    }

    user.isActive = true;
    user.activationKey = undefined;
    await user.save();

    res.json({ message: 'Account activated successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, description, profileImage, address } = req.body;
    const user = await User.findById(req.user.id);
    
    if (user) {
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.description = description || user.description;
      user.profileImage = profileImage || user.profileImage;
      user.address = address || user.address;
      
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }
    
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 char code
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'tilvaviraj@gmail.com',
        pass: process.env.GMAIL_PASS || 'vixd ovfa gvtn ucgd',
      },
    });

    await transporter.sendMail({
      from: `"SafeCity Security" <${process.env.GMAIL_USER || 'tilvaviraj@gmail.com'}>`,
      to: email,
      subject: "SafeCity Password Reset Code",
      html: `<h3>Password Reset Requested</h3><p>Your password reset code is: <b style="font-size: 24px; color: #dc2626;">${resetToken}</b></p><p>This code will expire in 1 hour.</p>`
    });

    res.json({ message: 'Reset code sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const user = await User.findOne({ 
      email, 
      resetPasswordToken: resetToken.toUpperCase(), 
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset code' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
