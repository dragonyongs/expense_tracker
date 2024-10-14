const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, profileController.createProfile);
router.get('/', authMiddleware, profileController.getProfiles);
router.get('/:member_id', authMiddleware, profileController.getProfileById);
router.put('/:id', authMiddleware, profileController.updateProfile);
router.delete('/:id', authMiddleware, profileController.deleteProfile);

module.exports = router;