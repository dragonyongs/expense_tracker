import { LuBuilding, LuSmartphone, LuCake, LuCalendarDays, LuHome } from 'react-icons/lu';
import { LiaFaxSolid } from 'react-icons/lia';
import { CiDeliveryTruck } from 'react-icons/ci';

const contactIcons = {
    company_phone: <LuBuilding />,
    work_mobile: <LuSmartphone />,
    personal_mobile: <LuSmartphone />,
    fax: <LiaFaxSolid />
};

const contactLabels = {
    company_phone: '회사',
    work_mobile: '업무',
    personal_mobile: '개인',
    fax: '팩스'
};

const dateIcons = {
    birthday: <LuCake />,
    default: <LuCalendarDays />
};

const dateLabels = {
    entry: '입사',
    leave: '퇴사',
    loa: '휴직',
    birthday: '생일'
};

const addressIcons = {
    home: <LuHome />,
    work: <LuBuilding />,
    delivery: <CiDeliveryTruck />
};

const addressLabels = {
    home: '집',
    work: '근무지',
    work_mobile: '업무',
    delivery: '배송'
};

export const renderContactIcon = (type) => contactIcons[type] || null;
export const renderContactLabel = (type) => contactLabels[type] || '미지정';

export const renderDateIcon = (type) => dateIcons[type] || dateIcons.default;
export const renderDateLabel = (type) => dateLabels[type] || '미지정';

export const renderAddressIcon = (type) => addressIcons[type] || null;
export const renderAddressLabel = (type) => addressLabels[type] || '미지정';