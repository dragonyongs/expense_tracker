import React from 'react';
import AdminHader from '../components/AdminHader';
import FlipCard from '../components/FlipCard';

const Admin = () => {
    return (
        <>
            <AdminHader />
            <div className='flex justify-center mt-12'>
                <FlipCard />
            </div>
        </>
    );
};

export default Admin;
