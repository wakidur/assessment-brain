const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Blog = require('../models/Blog');

// @desc      Get all blogs
// @route     GET /api/v1/blogs
// @access    Public
exports.getBlogs = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single blog
// @route     GET /api/v1/blogs/:id
// @access    Public
exports.getBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`blog not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: blog });
});

// @desc      Create new blog
// @route     POST /api/v1/blogs
// @access    Private
exports.createBlog = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;

  // Check for published blog
  const publishedBlog = await Blog.findOne({ user: req.user.id });

  // If the user is not an admin, they can only add one blog
  if (publishedBlog && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a blog`,
        400
      )
    );
  }

  const blog = await Blog.create(req.body);

  res.status(201).json({
    success: true,
    data: blog
  });
});

// @desc      Update blog
// @route     PUT /api/v1/blogs/:id
// @access    Private
exports.updateBlog = asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`blog not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is blog owner
  if (blog.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this blog`,
        401
      )
    );
  }

  blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: blog });
});

// @desc      Delete Blog
// @route     DELETE /api/v1/blogs/:id
// @access    Private
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is Blog owner
  if (blog.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this Blog`,
        401
      )
    );
  }

  await blog.remove();

  res.status(200).json({ success: true, data: {} });
});




