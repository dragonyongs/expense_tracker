const Card = require('../models/Card');
const Member = require('../models/Member');

exports.createCard = async (req, res) => {
    try {
        const card = new Card(req.body);
        console.log('card', card);
        
        await card.save();
        res.status(201).json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllCards = async (req, res) => {
    try {
        const cards = await Card.find()
            .populate('account_id', 'account_number bank_name')
            .populate({
                path: 'member_id',
                populate: {
                    path: 'status_id',
                    select: 'status_name'
                },
                select: 'member_name rank position'
            });

        const filteredCards = cards.filter(card => {
            const memberStatus = card.member_id?.status_id?.status_name;
            return memberStatus !== 'resigned';
        });

        res.json(filteredCards);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getCardById = async (req, res) => {
    try {
        const card = await Card.findById(req.params.id)
            .populate('account_id')
            .populate({
                path: 'member_id',
                populate: {
                    path: 'status_id',
                    select: 'status_name'
                },
                select: 'member_name rank position'
            });

        if (!card) return res.status(404).json({ error: 'Card not found' });

        const memberStatus = card.member_id?.status_id?.status_name;
        if (memberStatus === 'resigned') {
            return res.status(404).json({ error: 'Card belongs to a resigned member' });
        }

        res.json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getCardsByMemberId = async (req, res) => {
    try {
        const cards = await Card.find({ member_id: req.params.memberId })
            .populate('account_id')
            .populate({
                path: 'member_id',
                populate: {
                    path: 'status_id',
                    select: 'status_name'
                },
                select: 'member_name rank position'
            });

        if (!cards || cards.length === 0) {
            return res.status(404).json({ error: 'No cards found for this member' });
        }

        // Check if the member is resigned
        const memberStatus = cards[0]?.member_id?.status_id?.status_name;
        if (memberStatus === 'resigned') {
            return res.status(404).json({ error: 'Cards belong to a resigned member' });
        }

        res.json(cards);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a card by ID
exports.updateCard = async (req, res) => {
    try {
        const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!card) return res.status(404).json({ error: 'Card not found' });
        res.json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a card by ID
exports.deleteCard = async (req, res) => {
    try {
        const card = await Card.findByIdAndDelete(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card not found' });
        res.json({ message: 'Card deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
