const Blog = require('../models/Blog');

exports.createPost = async (req, res) => {
  try {
    const newPost = new Blog({
      ...req.body,
      author: req.user.id
    });
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Blog.find()
      .sort({ date: -1 })
      .populate('author', 'username');
    res.json(posts);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id)
      .populate('author', 'username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updatePost = async (req, res) => {
  try {
    let post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check user
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    post = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check user
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};