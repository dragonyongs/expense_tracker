export const DRAWER_SIZE = {
    mobile: '100%',
    desktop: '576px',
};

export const DRAWER_STYLES = (viewportHeight) => ({
    mobile: {
        width: DRAWER_SIZE.mobile,
        height: `${viewportHeight - 50}px`,
    },
    desktop: {
        left: '50%',
        marginLeft: '-50px',
        width: DRAWER_SIZE.desktop,
        height: 'calc(100vh - 145px)',
    },
});