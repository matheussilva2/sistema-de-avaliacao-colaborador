import { Link } from "react-router-dom";

type MenuItemprops = {
    isActive: boolean;
    link: string;
    label: string;
}

export const MenuItem = ({ isActive, link, label } : MenuItemprops) => {
    return(
        <Link
            className={
                `flex text items-center w-full h-12 px-5 ${isActive ? 'bg-[#006FEE] text-white font-semibold' : 'bg-white text-gray-950'}`
            }
            to={link}>
            <span>{label}</span>
        </Link>
    );
}