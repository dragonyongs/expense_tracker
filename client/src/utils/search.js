export const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => {
        if (!acc) return null; 
        if (Array.isArray(acc)) {
            return acc.map(item => item[part]).filter(Boolean).join(', ');
        }
        return acc[part];
    }, obj);
};

export const filterDataBySearchTerm = (data, field, term) => {
    const lowerTerm = term.toLowerCase();
    return data.filter((item) => {
        const value = getNestedValue(item, field);
        return value?.toString().toLowerCase().includes(lowerTerm);
    });
};