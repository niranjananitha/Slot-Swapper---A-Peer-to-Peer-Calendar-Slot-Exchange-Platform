const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const router = express.Router();

// User signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user with same email and name already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      name: name 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this name and email already exists' });
    }

    // Generate familyId based on email (same email = same family)
    const familyId = email.toLowerCase().replace(/[^a-z0-9]/g, '');

    const user = new User({ 
      name, 
      email: email.toLowerCase(), 
      password,
      familyId 
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, familyId: user.familyId }, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    let user;
    if (name) {
      // Login with specific family member
      user = await User.findOne({ 
        email: email.toLowerCase(), 
        name: name 
      });
    } else {
      // Login with any family member with this email
      user = await User.findOne({ email: email.toLowerCase() });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, familyId: user.familyId },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    res.json({ user: { id: user._id, name: user.name, email: user.email, familyId: user.familyId }, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;