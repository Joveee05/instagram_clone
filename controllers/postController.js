const express = require('express');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const post = await Post.find()
    .populate('postedBy', '_id name photo')
    .sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: post.length,
    data: {
      post,
    },
  });
});

exports.getAllPostsofFollwing = catchAsync(async (req, res, next) => {
  const post = await Post.find({
    postedBy: { $in: req.user.following },
  })
    .populate('postedBy', '_id name photo')
    .populate('comments.postedBy', '_id name')
    .sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: post.length,
    data: {
      post,
    },
  });
});

exports.getMyPosts = catchAsync(async (req, res, next) => {
  const post = await Post.find({ postedBy: req.user._id }).populate(
    'postedBy',
    '_id name photo'
  );
  res.status(200).json({
    status: 'success',
    results: post.length,
    data: {
      post,
    },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  req.user.role = undefined;
  req.user.following = undefined;
  req.user.passwordResetExpires = undefined;
  req.user.passwordResetToken = undefined;
  req.user.followers = undefined;
  const newPost = await Post.create({
    title: req.body.title,
    body: req.body.body,
    photo: req.body.photo,
    postedBy: req.user,
  });
  res.status(201).json({
    status: 'success',
    message: 'Post Created Successfully',
    data: newPost,
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('postedBy');
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: post,
  });
});

exports.editPost = catchAsync(async (req, res, next) => {
  const { title, body } = req.body;
  const edit = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!edit) {
    return next(new AppError('No post found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Post Updated Successfully',
    data: edit,
  });
});

exports.deletePostAdmin = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  res.status(204).json({
    data: null,
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const likes = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    { new: true }
  ).populate('postedBy');

  if (!likes) {
    return next(new AppError('No post found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: likes,
  });
});

exports.unlikePost = catchAsync(async (req, res, next) => {
  const unlike = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    { new: true }
  );

  if (!unlike) {
    return next(new AppError('No post found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: unlike,
  });
});

exports.postComment = catchAsync(async (req, res, next) => {
  const userComment = await Post.findByIdAndUpdate(
    req.body.id,
    {
      $push: { comments: { user: req.user.email, comment: req.body.comment } },
    },
    { new: true }
  );

  if (!userComment) {
    return next(new AppError('No post found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: userComment,
  });
});

exports.removeComment = catchAsync(async (req, res, next) => {
  const userComment = await Post.findByIdAndUpdate(
    req.body.id,
    {
      $pull: { comments: { user: req.user.email, comment: req.body.comment } },
    },
    { new: true }
  );

  if (!userComment) {
    return next(new AppError('Not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ _id: req.params.id });
  if (!post) {
    return next(new AppError('Not found', 404));
  }
  if (post.postedBy._id.toString() === req.user.id.toString()) {
    await post.remove();
  } else {
    return next(new AppError('You can only delete posts made by you', 401));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
