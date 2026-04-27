import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type MenuItemprops = {
    isActive: boolean;
    link: string;
    children: ReactNode;
}

export const MenuItem = ({ isActive, link, children } : MenuItemprops) => {
    return(
        <Link
            className={
                `flex text items-center w-full h-12 px-5 ${isActive ? 'bg-[#006FEE] text-white font-semibold' : 'bg-white text-gray-950'}`
            }
            to={link}>
           {children}
        </Link>
    );
}