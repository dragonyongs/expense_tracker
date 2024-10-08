import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';
import Header from '../components/Header';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    return (
        <>
            <Header />
            <div className='flex flex-col w-full'>  
                {user.role === ('super_admin') ? (
                    <div className='p-8'>
                        <p>{user.role}</p>
                    </div>
                ) : (
                    <div className='h-full bg-white dark:bg-slate-800'>
                        <CardBalance role={user.role} />
                        <PayHistory />
                    </div>
                ) }
            </div>
        </>
    );
};

export default Dashboard;
