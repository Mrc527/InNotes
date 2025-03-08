"use client";

import React, {useState} from 'react';
import { Session } from 'next-auth';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Avatar from '@radix-ui/react-avatar';
import { HomeIcon, PersonIcon, MagnifyingGlassIcon, NotionLogoIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import {useRouter} from "next/navigation";

interface SidebarProps {
    session: Session | null;
}

const Sidebar: React.FC<SidebarProps> = ({ session }) => {
    const userInitials = session?.user?.email ? session.user.email[0].toUpperCase() : 'N/A';
    const { theme, setTheme } = useTheme();
    const [search, setSearch] = useState("");
    const router = useRouter();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSearchClick = () => {
        router.push(`/dashboard/contacts?search=${search}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    return (
        <div className="fixed w-64 flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">InNotes</h1>
            </div>

            {/* Search Bar */}
            <div className="p-3">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        value={search}
                    />
                </div>
            </div>

            {/* Navigation */}
            <NavigationMenu.Root className="flex-1 p-3">
                <NavigationMenu.List>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link asChild>
                            <Link href="/dashboard/kanban" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                <HomeIcon className="h-5 w-5 mr-2" />
                                Kanban
                            </Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link asChild>
                            <Link href="/dashboard/contacts" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                <PersonIcon className="h-5 w-5 mr-2" />
                                Contacts
                            </Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link asChild>
                            <a href="/dashboard/notes" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                <NotionLogoIcon className="h-5 w-5 mr-2" />
                                Notes
                            </a>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
            </NavigationMenu.Root>
            <div className="p-3">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                >
                    {theme === 'dark' ? <SunIcon className="h-5 w-5 mr-2" /> : <MoonIcon className="h-5 w-5 mr-2" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
            {/* User Icon */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                    <Avatar.Root className="w-8 h-8 rounded-full bg-gray-500 dark:bg-gray-600">
                        <Avatar.Fallback className="text-sm font-medium text-gray-100 dark:text-gray-200">{userInitials}</Avatar.Fallback>
                    </Avatar.Root>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{session?.user?.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
