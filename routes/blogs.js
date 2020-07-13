const express = require('express');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogs');

const Blog = require('../models/Blog');

// Include other resource routers
const commentRouter = require('./Comments');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers

router.use('/:blogId/comments', commentRouter);



router
  .route('/')
  .get(advancedResults(Blog), getBlogs)
  .post(protect, authorize('bloggers', 'admin'), createBlog);

router
  .route('/:id')
  .get(getBlog)
  .put(protect, authorize('bloggers' , 'admin'), updateBlog)
  .delete(protect, authorize('bloggers', 'admin'), deleteBlog);

module.exports = router;
