const Card = require('../models/Card');

// Create a new card
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

// Get all cards
exports.getAllCards = async (req, res) => {
    try {
        const cards = await Card.find().populate('account_id').populate('member_id');
        res.json(cards);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a card by ID
exports.getCardById = async (req, res) => {
    try {
        const card = await Card.findById(req.params.id).populate('account_id').populate('member_id');
        if (!card) return res.status(404).json({ error: 'Card not found' });
        res.json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get cards by member_id
exports.getCardsByMemberId = async (req, res) => {
    try {
        const cards = await Card.find({ member_id: req.params.memberId}).populate('account_id').populate('member_id');
        
        if (!cards || cards.length === 0) {
            return res.status(404).json({ error: 'No cards found for this member' });
        }
        
        res.json(cards[0]);
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
