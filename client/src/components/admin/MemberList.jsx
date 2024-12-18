import React from 'react';
import { MdKeyboardArrowRight } from "react-icons/md";

const MemberList = ({ members, onMemberSelect }) => (
    <div className='flow-root space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700'>
        {members.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">현재 요청중인 사용자가 없습니다.</p>
        ) : (
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.map(({ _id, member_name, status_id, team_id, photoUrl }) => {
                    const isPending = status_id.status_name === 'pending';
                    const isResigned = status_id.status_name === 'resigned';
                    const statusClass = isPending ? 'bg-blue-600 text-white' : isResigned ? 'bg-red-600 text-red-300' : 'bg-white text-gray-700 border border-gray-400';

                        return (
                            <li key={_id} onClick={() => onMemberSelect(_id)} className='py-3 sm:py-4 cursor-pointer'>
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${statusClass} overflow-hidden flex items-center justify-center`}>
                                        {photoUrl ? <img src={photoUrl} alt={member_name} /> : member_name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0 ms-4">
                                        <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                            {member_name}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                            {isPending ? `미승인` : team_id?.team_name || ''}
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                        <MdKeyboardArrowRight className='text-2xl' />
                                    </div>
                                </div>
                            </li>
                        )
                    })
                }
            </ul>
        )}
    </div>
);

export default MemberList;