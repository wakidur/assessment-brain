const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the Comment'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  blog: {
    type: mongoose.Schema.ObjectId,
    ref: 'Blog',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from submitting more than one Comment per blog
CommentSchema.index({ blog: 1, user: 2 }, { unique: true });

// Static method to get avg rating and save
CommentSchema.statics.getAverageRating = async function(blogId) {
  const obj = await this.aggregate([
    {
      $match: { blog: blogId }
    },
    {
      $group: {
        _id: '$blog',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('Blog').findByIdAndUpdate(blogId, {
      averageRating: obj[0].averageRating
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
CommentSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.blog);
});

// Call getAverageCost before remove
CommentSchema.pre('remove', async function() {
  await this.constructor.getAverageRating(this.blog);
});

module.exports = mongoose.model('Comment', CommentSchema);
