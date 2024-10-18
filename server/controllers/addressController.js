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
        // 주소 업데이트
        const updatedAddress = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        console.log("updatedAddress:", updatedAddress);

        if (!updatedAddress) return res.status(404).json({ message: 'Address not found' });

        // 프로필에서 해당 주소 ID를 찾아서 업데이트
        const profile = await Profile.findOne({ addresses: req.params.id });
        if (profile) {
            // addresses 배열에서 해당 주소 ID를 찾아 업데이트된 주소로 교체
            profile.addresses = profile.addresses.map(addressId =>
                addressId.toString() === req.params.id ? updatedAddress._id : addressId
            );

            console.log('Profile before saving:', profile);
            await profile.save(); // 프로필 저장
            console.log('Profile after saving:', profile);
        } else {
            console.log('Profile not found for the address ID.');
        }

        res.status(200).json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
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