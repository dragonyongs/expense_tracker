export const DRAWER_STYLES = (isMobile, viewportHeight) => ({
    mobile: isMobile ? {
        width: '100%',
        height: `${viewportHeight - 50}px`,
    } : {},
    desktop: !isMobile ? {
        left: '50%',
        marginLeft: '-50px',
        width: '576px',
        height: 'calc(100vh - 145px)',
    } : {},
});