import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className='flex-1 bg-white'>  
            {user.role === ('super_admin') ? (
                <div className='p-8'>
                    <p>{user.role}</p>
                </div>
            ) : (
                <>
                    <CardBalance role={user.role} />
                    <PayHistory />
                </>
            ) }
        </div>
    );
};

export default Dashboard;
