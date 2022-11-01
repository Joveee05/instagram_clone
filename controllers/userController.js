const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const allUsers = await User.find();
  res.status(200).json({
    status: 'success',
    results: allUsers.length,
    data: {
      allUsers,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates', 400));
  }
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const userPost = await Post.find({ postedBy: req.params.id });
  if (!user) {
    return next(new AppError('No user found with this ID'), 404);
  }
  res.status(200).json({
    status: 'success',
    message: 'user found',
    data: { user, userPost },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with this ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const modifiedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!modifiedUser) {
    return next(new AppError('No user found with this ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'user modification successful',
    data: modifiedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    message: 'User deleted successfully',
    data: null,
  });
});

exports.follow = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.body.id,
    {
      $push: { followers: req.user.id },
    },
    { new: true }
  ).then(
    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: req.body.id },
    })
  );

  res.status(200).json({
    status: 'success',
    message: 'User followed successfully',
    data: user,
  });
});

exports.unfollow = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.body.id,
    {
      $pull: { followers: req.user.id },
    },
    { new: true }
  ).then(
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.body.id },
    })
  );
  res.status(200).json({
    status: 'success',
    message: 'User unfollowed successfully',
    data: user,
  });
});

exports.searchUser = catchAsync(async (req, res, next) => {
  const search = new RegExp('^' + req.query.email);
  const user = await User.find({ email: { $regex: search } }).select(
    '_id name email photo '
  );

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
