"use client";

import React from 'react';
import {useSidebarContext} from "@/components/sidebarContext";

interface MainContentProps {
    children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
    return (
        <main className={`flex-1 p-4 ${useSidebarContext().isCollapsed ? 'ml-12' : 'ml-64'}`}>
            {children}
        </main>
    );
};

export default MainContent;
