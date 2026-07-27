const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { joinWaitingList, getMyWaitingList, removeFromWaitingList } = require('../controllers/waitingListController');

router.post('/', auth, authorize('traveler'), joinWaitingList);
router.get('/', auth, authorize('traveler'), getMyWaitingList);
router.delete('/:id', auth, authorize('traveler'), removeFromWaitingList);

module.exports = router;
