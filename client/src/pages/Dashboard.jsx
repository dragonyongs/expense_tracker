import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className='flex flex-col w-full h-full'>  
            {user.role === ('super_admin') ? (
                <div className='p-8'>
                    <p>{user.role}</p>
                </div>
            ) : (
                <div className='h-full bg-white'>
                    <CardBalance role={user.role} />
                    <PayHistory />
                </div>
            ) }
        </div>
    );
};

export default Dashboard;
