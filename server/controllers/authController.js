const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await User.create({ username, email, password });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "User already exists or invalid data" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (password !== user.password)
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );
  res.json({
    token,
    user: { id: user._id, username: user.username, role: user.role },
  });
};
