const Address = require('../models/Address');
const Profile = require('../models/Profile');

exports.createAddress = async (req, res) => {
    try {
        const { address_type, address_name, address_line1, address_line2, postal_code, member_id } = req.body;

        const newAddress = new Address({
            member_id,
            address_type,
            address_name,
            address_line1,
            address_line2,
            postal_code
        });

        const saveAddress = await newAddress.save();

        let profileRes = await Profile.findOne({ member_id });

        if (!profileRes) {
            profileRes = new Profile({
                member_id,
                phones: []
            });
        }
        
        profileRes.addresses.push(saveAddress._id);
        await profileRes.save();

        res.status(201).json(saveAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


exports.getAddresses = async (req, res) => {
    try {
        const addressRes = await Address.find({ member_id: req.params.member_id });
        res.status(200).json(addressRes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const updatedAddressRes = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        console.log("updatedAddress:", updatedAddress);
        
        if (!updatedAddressRes) return res.status(404).json({ message: 'Address not found' });

        const profileRes = await Profile.findOne({ addresses: req.params.id });
        if (profileRes) {
            profileRes.addresses = profileRes.addresses.map(addressId =>
                addressId.toString() === req.params.id ? updatedAddressRes._id : addressId
            );
            await profileRes.save();
            console.log('Profile updated:', profileRes); // 중복된 로그 방지
        }

        res.status(200).json(updatedAddressRes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a phone contact by ID
exports.deleteAddress = async (req, res) => {
    try {
        const deletedAddressRes = await Address.findByIdAndDelete(req.params.id);
        if (!deletedAddressRes) return res.status(404).json({ message: 'Address not found' });
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};