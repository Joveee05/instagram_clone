const express = require('express');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const authController = require('../controllers/authentication');

const router = express.Router();

router.post('/sign-up/admin', authController.createAdmin);

router.post('/sign-up', authController.createUser);

router.get('/logout', authController.logout);

router.post('/login', authController.login);

router.use(authController.protect);

router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.put('/follow', userController.follow);

router.put('/unfollow', userController.unfollow);

router.patch('/updateMyPassword', authController.updatePassword);

router.post('/search', userController.searchUser);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.patch('/deleteMe', userController.deleteMe);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.use(authController.restrictTo('admin'));

router.get('/', userController.getAllUsers);

module.exports = router;
