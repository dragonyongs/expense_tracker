import React from 'react'
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
// import axios from "../../services/axiosInstance"; 
// import { API_URLS } from '../../services/apiUrls';
import useMediaQuery from '../../hooks/useMediaQuery';
import useViewportHeight from '../../hooks/useViewportHeight';
import { DRAWER_STYLES } from '../../styles/drawerStyles';
import { FaChevronDown } from "react-icons/fa";

const PasswordChangeDrawer = ({ isOpen, onClose, title }) => {

  const isMobile = useMediaQuery('(max-width: 640px)');
  const viewportHeight = useViewportHeight();
  const styles = DRAWER_STYLES(isMobile, viewportHeight);

  return (
      <Drawer open={isOpen} onClose={onClose} duration='300' direction='bottom' className="rounded-tr-lg rounded-tl-lg" style={isMobile ? styles.mobile : styles.desktop}>
          <div className="flex justify-between py-4 px-6 dark:bg-slate-800">
              <h5 className="text-lg font-bold dark:text-slate-200">{title}</h5>
              <button onClick={onClose} className='text-2xl dark:text-slate-300 mb-4'>
                  <FaChevronDown />
              </button>
          </div>
      </Drawer>
  )
}

export default PasswordChangeDrawer;