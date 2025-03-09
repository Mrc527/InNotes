// /components/Sidebar.tsx
"use client";

import React, {useState} from 'react';
import { Session } from 'next-auth';
import * as Avatar from '@radix-ui/react-avatar';
import {
    HomeIcon,
    PersonIcon,
    MagnifyingGlassIcon,
    NotionLogoIcon,
    HamburgerMenuIcon,
    Cross2Icon, ChevronRightIcon, ChevronLeftIcon, ColumnsIcon
} from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import {useRouter} from "next/navigation";
import {
    Flex,
    Text,
    Button,
    Heading,
} from '@radix-ui/themes';
import {Input} from "@/components/input";

interface SidebarProps {
    session: Session | null;
}

const Sidebar: React.FC<SidebarProps> = ({ session }) => {
    const userInitials = session?.user?.email ? session.user.email[0].toUpperCase() : 'N/A';
    const { theme, setTheme } = useTheme();
    const [search, setSearch] = useState("");
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

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

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <Flex
            direction="column"
            height="100vh"
            width={isCollapsed ? "12" : "64"}
            gap="3"
            style={{
                borderRight: '1px solid var(--colors-gray-800)',
                transition: 'width 0.3s ease-in-out',
                overflow: 'hidden',
            }}
        >
            {/* Collapse Button */}
            <Flex
              height="16"
              align="center"
              justify="between"
              style={{borderBottom: '1px solid var(--colors-gray-800)'}}
            >
                <div /> {/* Empty div to take up space on the left */}
                <Button onClick={toggleCollapse} variant="ghost" style={{width: 'auto', justifyContent: 'center'}}>
                    {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
                </Button>
            </Flex>

            {/* Logo */}
            {!isCollapsed && (
                <Flex
                    height="16"
                    align="center"
                    justify="center"
                    style={{borderBottom: '1px solid var(--colors-gray-800)'}}
                >
                    <Heading size="4">InNotes</Heading>
                </Flex>
            )}

            {/* Search Bar */}
            {!isCollapsed && (
                <Flex px="3">
                    <Flex direction="row" align="center" gap="2">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            value={search}
                            style={{backgroundColor: 'var(--colors-gray-700)', color: 'var(--colors-gray-100)'}}
                        />
                    </Flex>
                </Flex>
            )}

            {/* Navigation */}
            <Flex direction="column" px="3" gap="2" flex="1">
                <Link href="/dashboard">
                    <Button variant="ghost" style={{width: '100%', justifyContent: 'flex-start', border: '1px solid var(--colors-gray-700)'}}>
                        <Flex align="center" gap="2">
                            <HomeIcon className="h-5 w-5" />
                            {!isCollapsed && <Text>Home</Text>}
                        </Flex>
                    </Button>
                </Link>
                <Link href="/dashboard/kanban">
                    <Button variant="ghost" style={{width: '100%', justifyContent: 'flex-start', border: '1px solid var(--colors-gray-700)'}}>
                        <Flex align="center" gap="2">
                            <ColumnsIcon className="h-5 w-5" />
                            {!isCollapsed && <Text>Kanban</Text>}
                        </Flex>
                    </Button>
                </Link>
                <Link href="/dashboard/contacts">
                    <Button variant="ghost" style={{width: '100%', justifyContent: 'flex-start', border: '1px solid var(--colors-gray-700)'}}>
                        <Flex align="center" gap="2">
                            <PersonIcon className="h-5 w-5" />
                            {!isCollapsed && <Text>Contacts</Text>}
                        </Flex>
                    </Button>
                </Link>
                <Link href="/dashboard/notes">
                    <Button variant="ghost" style={{width: '100%', justifyContent: 'flex-start', border: '1px solid var(--colors-gray-700)'}}>
                        <Flex align="center" gap="2">
                            <NotionLogoIcon className="h-5 w-5" />
                            {!isCollapsed && <Text>Notes</Text>}
                        </Flex>
                    </Button>
                </Link>
            </Flex>

            <Flex px="3">
                <Button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    variant="ghost"
                    style={{width: '100%', justifyContent: 'center'}}
                >
                    <Flex align="center" gap="2">
                        {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                        {!isCollapsed && <Text>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</Text>}
                    </Flex>
                </Button>
            </Flex>

            {/* User Icon */}
            <Flex
                p="4"
                direction="column"
                style={{
                    borderTop: '1px solid var(--colors-gray-800)',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                }}
            >
                <Flex align="center" gap="3">
                    <Avatar.Root className="w-8 h-8 rounded-full bg-gray-500 dark:bg-gray-600">
                        <Avatar.Fallback className="text-sm font-medium text-gray-100 dark:text-gray-200">{userInitials}</Avatar.Fallback>
                    </Avatar.Root>
                    <Flex direction="column">
                        <Text size="2" weight="medium">{session?.user?.name}</Text>
                        <Text size="1" color="gray">{session?.user?.email}</Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default Sidebar;
