const Account = require('../models/Account');
const Card = require('../models/Card');
const Member = require('../models/Member');

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

        const members = await Member.find().lean();
        const resignedMemberIds = members
            .filter(member => member.status_id?.status_name === 'resigned')
            .map(member => member._id.toString());

        const accountData = await Promise.all(accounts.map(async (account) => {
            const cards = await Card.find({ account_id: account._id })
                .populate('member_id', 'member_name rank position status_id')
                .lean();

            const filteredCards = cards.filter(card => {
                const memberId = card.member_id?._id?.toString();
                return !resignedMemberIds.includes(memberId);
            });
            
            console.log('filteredCards', filteredCards);

            return {
                ...account,
                cards: filteredCards.map(card => ({
                    card_type: card.card_type,
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
        const memberId = req.params.memberId;

        // 멤버의 정보를 가져오며 상태 확인
        const member = await Member.findById(memberId)
            .populate('status_id', 'status_name')
            .lean();

        if (!member || member.status_id?.status_name === 'resigned') {
            return res.status(404).json({ error: 'Member not found or is resigned' });
        }

        // 팀 ID와 관련된 계좌 조회
        const accounts = await Account.find({ team_id: member.team_id })
            .populate({
                path: 'team_id',
                select: 'team_name',
            })
            .lean();

        // 계좌와 카드 데이터 필터링
        const accountData = await Promise.all(accounts.map(async (account) => {
            const cards = await Card.find({ account_id: account._id })
                .populate({
                    path: 'member_id',
                    populate: { path: 'status_id', select: 'status_name' },
                    select: 'member_name rank position',
                })
                .lean();

            // 팀원이 볼 수 있는 카드 필터링
            const filteredCards = cards.filter(card => {
                // 1. 카드가 본인 소유이거나
                // 2. 카드 타입이 야근식대인 경우
                return (
                    card.member_id?._id.toString() === memberId ||
                    card.card_type === "OvertimeMealCard"
                );
            });
console.log('filteredCards', filteredCards);
            return {
                ...account,
                cards: accountData.map(card => ({
                    card_type: card.card_type,
                    card_number: card.card_number,
                    limit: card.limit,
                    rollover_amount: card.rollover_amount,
                    balance: card.balance,
                    member_id: card.member_id._id,
                    member_name: card.member_id.member_name,
                    rank: card.member_id.rank,
                    position: card.member_id.position,
                    team_fund: card.team_fund,
                })),
            };
        }));

        res.json(accountData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user-specific account and card data', error });
    }
};

{/*
exports.getMemberAccountsAndCards = async (req, res) => {
    try {
        const memberId = req.params.memberId;

        // 멤버의 정보를 가져오며 상태(status_id) 확인
        const member = await Member.findById(memberId)
            .populate('status_id', 'status_name')
            .lean();

        // 멤버가 존재하지 않거나 퇴사자인 경우 처리
        if (!member || member.status_id?.status_name === 'resigned') {
            return res.status(404).json({ error: 'Member not found or is resigned' });
        }

        // 멤버의 팀 ID 가져오기
        const userTeamId = member.team_id;

        // 팀 ID에 연결된 계좌 가져오기
        const accounts = await Account.find({ team_id: userTeamId })
            .populate({
                path: 'team_id',
                select: 'team_name'
            })
            .lean();

        // 각 계좌에 연결된 카드 정보 가져오기 (퇴사자 제외)
        const accountData = await Promise.all(accounts.map(async (account) => {
            const cards = await Card.find({ account_id: account._id })
                .populate({
                    path: 'member_id',
                    populate: {
                        path: 'status_id',
                        select: 'status_name'
                    },
                    select: 'member_name rank position'
                })
                .lean();

            // 퇴사자 필터링
            const filteredCards = cards.filter(card => {
                const cardMemberStatus = card.member_id?.status_id?.status_name;
                return cardMemberStatus !== 'resigned';
            });

            return {
                ...account,
                cards: filteredCards.map(card => ({
                    card_type: card.card_type,
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
*/}
