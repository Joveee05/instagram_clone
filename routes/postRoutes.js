const express = require('express');
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authentication');

const router = express.Router();

router.use(authController.protect);

router.get('/all-posts', postController.getAllPosts);

router.get('/', postController.getAllPostsofFollwing);

router.get('/myPosts', postController.getMyPosts);

router.post('/new-post', postController.createPost);

router.put('/like', postController.likePost);

router.put('/comment', postController.postComment);

router.put('/remove-comment', postController.removeComment);

router.delete('/delete-post/:id', postController.deletePost);

router.put('/unlike', postController.unlikePost);

router.route('/:id').get(postController.getPost).patch(postController.editPost);

router.use(authController.restrictTo('admin'));

router.route('/:id').delete(postController.deletePostAdmin);

module.exports = router;
