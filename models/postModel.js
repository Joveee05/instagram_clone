const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A post must have a title. Please enter a title'],
    },
    body: {
      type: String,
      required: [true, 'A post must have a body-text. Please enter text'],
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    photo: {
      type: String,
      required: [true, 'A post must have a picture'],
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
  { versionKey: false }
);

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'postedBy',
    select: 'name',
  });
  next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
