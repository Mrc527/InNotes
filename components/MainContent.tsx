"use client";

import React from 'react';
import {useSidebarContext} from "@/components/sidebarContext";

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({children}) => {
  const {isCollapsed} = useSidebarContext();

  return (
    <main className="flex-1 p-4" style={{marginLeft: `calc(${isCollapsed ? '3rem' : '13rem'})`}}>
      {children}
    </main>
  );
};

export default MainContent;
