import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { getFileTypeInfo } from "../../../utils/approval";
import { MdClose } from 'react-icons/md';
import { format } from 'date-fns';

const FilePreviewDrawer = ({ file, isOpen, onClose }) => {
    if (!file) return null;

    const { icon, bgColor, textColor } = getFileTypeInfo(file.type);

    return (
        <Drawer
        open={isOpen}
        onClose={onClose}
        direction="right"
        size={320}
        className="p-6"
        >
        <div className="space-y-6">
            <div className="flex justify-between items-center">
            <h5 className="text-xl font-bold">파일 상세</h5>
            <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <MdClose className="h-6 w-6" />
            </button>
            </div>

            <div className={`p-4 ${bgColor} rounded-lg`}>
            <div className="flex items-center gap-3">
                {icon}
                <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${textColor}`}>{file.name}</p>
                <p className="text-sm text-gray-500">{format(new Date(file.uploadedAt), 'yyyy.MM.dd HH:mm')}</p>
                </div>
            </div>
            </div>

            {file.type.startsWith('image/') ? (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-contain"
                />
            </div>
            ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">미리보기를 지원하지 않는 파일 형식입니다.</p>
            </div>
            )}

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
            다운로드
            </button>
        </div>
        </Drawer>
    );
};

export default FilePreviewDrawer;