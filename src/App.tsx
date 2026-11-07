import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { Header } from './components/layout/Header';
import { Workspace } from './components/layout/Workspace';
import { AuthModal } from './components/auth/AuthModal';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SessionProvider>
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#09090B]">
          <Header />
          <Workspace />
          <AuthModal />
        </div>
      </SessionProvider>
    </AuthProvider>
  );
};

export default App;

