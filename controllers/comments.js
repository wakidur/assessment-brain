const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

// @desc      Get comments
// @route     GET /api/v1/comments
// @route     GET /api/v1/blogs/:blogId/comments
// @access    Public
exports.getComments = asyncHandler(async (req, res, next) => {
  if (req.params.blogId) {
    const comments = await Comment.find({ blog: req.params.blogId });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single comment
// @route     GET /api/v1/comments/:id
// @access    Public
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id).populate({
    path: 'blog',
    select: 'name description'
  });

  if (!comment) {
    return next(
      new ErrorResponse(`No comment found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: comment
  });
});

// @desc      Add comment
// @route     POST /api/v1/blogs/:blogId/comments
// @access    Private
exports.addComment = asyncHandler(async (req, res, next) => {
  req.body.blog = req.params.blogId;
  req.body.user = req.user.id;

  const blog = await blog.findById(req.params.blogId);

  if (!blog) {
    return next(
      new ErrorResponse(
        `No blog with the id of ${req.params.blogId}`,
        404
      )
    );
  }

  const comment = await Comment.create(req.body);

  res.status(201).json({
    success: true,
    data: comment
  });
});

// @desc      Update comment
// @route     PUT /api/v1/comments/:id
// @access    Private
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`No comment with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure comment belongs to user or user is bloggers
  if (comment.user.toString() !== req.user.id && req.user.role !== 'bloggers') {
    return next(new ErrorResponse(`Not authorized to update comment`, 401));
  }

  comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  comment.save();

  res.status(200).json({
    success: true,
    data: comment
  });
});

// @desc      Delete comment
// @route     DELETE /api/v1/comments/:id
// @access    Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`No comment with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure comment belongs to user or user is bloggers
  if (comment.user.toString() !== req.user.id && req.user.role !== 'bloggers') {
    return next(new ErrorResponse(`Not authorized to update comment`, 401));
  }

  await comment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
