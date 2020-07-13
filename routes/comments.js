const express = require('express');
const {
  getComments,
  getComment,
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/comments');

const Comment = require('../models/Comment');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Comment, {
      path: 'blog',
      select: 'name description'
    }),
    getComments
  )
  .post(protect, authorize('commenter', 'bloggers', 'admin'), addComment);

router
  .route('/:id')
  .get(getComment)
  .put(protect, authorize('commenter', 'bloggers', 'admin'), updateComment)
  .delete(protect, authorize('commenter', 'bloggers', 'admin'), deleteComment);

module.exports = router;
