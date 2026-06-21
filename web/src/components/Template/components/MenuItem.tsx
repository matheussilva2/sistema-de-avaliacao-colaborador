import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type MenuItemprops = {
    isActive: boolean;
    link: string;
    onClick?: () => void;
    isCompact?: boolean;
    children: ReactNode;
}

export const MenuItem = ({ isActive, link, onClick, isCompact = false, children } : MenuItemprops) => {
    return(
        <Link
            className={
                `flex items-center w-full h-12 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isCompact ? 'justify-center px-2' : 'px-5'} ${isActive ? 'bg-[#006FEE] text-white font-semibold hover:bg-[#0057c2]' : 'bg-white text-gray-950 hover:bg-primary-50 hover:text-primary'}`
            }
            to={link}
            onClick={onClick}>
           {children}
        </Link>
    );
}
