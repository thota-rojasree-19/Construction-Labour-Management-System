import React from 'react';
import { 
    FaHardHat, 
    FaTruck, 
    FaUtensils, 
    FaCogs, 
    FaGasPump, 
    FaTools, 
    FaBuilding, 
    FaShieldAlt, 
    FaBed, 
    FaLightbulb, 
    FaWrench, 
    FaCoins 
} from 'react-icons/fa';

export default function ExpenseCategoryBadge({ category }) {
    const getCategoryConfig = () => {
        const catLower = category ? category.toLowerCase().replace(' ', '') : 'miscellaneous';
        switch (catLower) {
            case 'labour':
                return { className: 'labour', icon: <FaHardHat />, label: 'Labour' };
            case 'transport':
                return { className: 'transport', icon: <FaTruck />, label: 'Transport' };
            case 'food':
                return { className: 'food', icon: <FaUtensils />, label: 'Food' };
            case 'machinery':
                return { className: 'machinery', icon: <FaCogs />, label: 'Machinery' };
            case 'fuel':
                return { className: 'fuel', icon: <FaGasPump />, label: 'Fuel' };
            case 'materials':
                return { className: 'materials', icon: <FaTools />, label: 'Materials' };
            case 'equipmentrental':
                return { className: 'equipmentrental', icon: <FaBuilding />, label: 'Rental' };
            case 'safetyequipment':
                return { className: 'safetyequipment', icon: <FaShieldAlt />, label: 'Safety' };
            case 'accommodation':
                return { className: 'accommodation', icon: <FaBed />, label: 'Lodging' };
            case 'utilities':
                return { className: 'utilities', icon: <FaLightbulb />, label: 'Utilities' };
            case 'maintenance':
                return { className: 'maintenance', icon: <FaWrench />, label: 'Maintenance' };
            case 'miscellaneous':
            default:
                return { className: 'miscellaneous', icon: <FaCoins />, label: category || 'Misc' };
        }
    };

    const { className, icon, label } = getCategoryConfig();

    return (
        <span className={`category-badge ${className}`}>
            {icon}
            <span>{label}</span>
        </span>
    );
}
