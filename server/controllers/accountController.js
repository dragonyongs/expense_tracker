const Account = require('../models/Account');
const Card = require('../models/Card');

// Create a new account
exports.createAccount = async (req, res) => {
    try {
        const account = new Account(req.body);
        await account.save();
        res.status(201).json(account);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all accounts
exports.getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.find()
            .populate('team_id', 'team_name department_id');
        res.json(accounts);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get an account by ID
exports.getAccountById = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id).populate('team_id');
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json(account);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update an account by ID
exports.updateAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json(account);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete an account by ID
exports.deleteAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndDelete(req.params.id);
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 계좌 및 해당 카드 정보 가져오기
exports.getAccountsAndCards = async (req, res) => {
    try {
        const accounts = await Account.find()
            .populate({
                path: 'team_id',
                select: 'team_name'
            })
            .lean();

        // 각 계좌에 연결된 카드 정보 가져오기
        const accountData = await Promise.all(accounts.map(async (account) => {
            const cards = await Card.find({ account_id: account._id })
                .populate('member_id', 'member_name rank position')
                .lean();
            
            return {
                ...account,
                cards: cards.map(card => ({
                    card_number: card.card_number,
                    balance: card.balance,
                    member_name: card.member_id.member_name,
                    rank: card.member_id.rank,
                    position: card.member_id.position,
                }))
            };
        }));

        res.json(accountData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching account and card data', error });
    }
};

exports.getMemberAccountsAndCards = async (req, res) => {
    try {
        // const userId = req.user.member_id; // 로그인한 사용자의 ID
        const memberId = req.params.id;

        const memberCard = await Card.findOne({member_id: memberId})
            .populate('member_id', 'team_id')

        const userTeamId = memberCard.member_id.team_id; // 사용자의 팀 ID

        // 로그인 사용자의 팀 ID와 일치하는 계좌를 가져옴
        const accounts = await Account.find({ team_id: userTeamId })
            .populate({
                path: 'team_id',
                select: 'team_name'
            })
            .lean();

        // 각 계좌에 연결된 카드 정보 가져오기 (사용자 본인의 카드 포함)
        const accountData = await Promise.all(accounts.map(async (account) => {
            const cards = await Card.find({ account_id: account._id })
                .populate('member_id', 'member_name rank position')
                .lean();

            return {
                ...account,
                cards: cards.map(card => ({
                    card_number: card.card_number,
                    limit: card.limit,
                    rollover_amount: card.rollover_amount,
                    balance: card.balance,
                    member_id: card.member_id._id,
                    member_name: card.member_id.member_name,
                    rank: card.member_id.rank,
                    position: card.member_id.position,
                    team_fund: card.team_fund,
                }))
            };
        }));

        res.json(accountData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user-specific account and card data', error });
    }
};