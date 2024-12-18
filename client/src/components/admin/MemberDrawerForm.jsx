import React from 'react';
import InputField from '../InputField';
import SelectField from '../SelectField';

const MemberDrawerForm = ({
    member,
    statuses,
    teams,
    roles,
    onSave,
    onClose,
    onChange,
    onStatusChange,
    onTeamChange,
    onRoleChange,
}) => (
    <form>
        <InputField label="이름" value={member.member_name} onChange={e => onChange('member_name', e.target.value)} />
        <SelectField label="상태" options={statuses} value={member.status_id} onChange={onStatusChange} />
        <SelectField label="소속" options={teams} value={member.team_id} onChange={onTeamChange} />
        <SelectField label="권한" options={roles} value={member.role_id} onChange={onRoleChange} />
        <button onClick={onSave}>저장</button>
        <button onClick={onClose}>닫기</button>
    </form>
);

export default MemberDrawerForm;
