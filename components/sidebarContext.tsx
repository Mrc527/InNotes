// /components/sidebarContext.tsx
"use client";

import {createContext, useState, useContext, ReactNode} from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({children}: { children: ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
      <SidebarContext.Provider value={{isCollapsed, toggleCollapse}}>
          {children}
      </SidebarContext.Provider>
    );
};

export const useSidebarContext = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebarContext must be used within a SidebarProvider');
    }
    return context;
};
