import React from 'react';
import './App.css';
import { AppStateProvider } from './context/AppStateContext';
import EmulatorContainer from './components/MobileEmulator/EmulatorContainer';
import DashboardContainer from './components/AdminDashboard/DashboardContainer';

function App() {
  return (
    <AppStateProvider>
      <div className="playground-container animate-fade-in">
        
        {/* Left Side: Mobile App Emulator */}
        <EmulatorContainer />

        {/* Right Side: Back-Office Admin Panel */}
        <div className="admin-section">
          <DashboardContainer />
        </div>

      </div>
    </AppStateProvider>
  );
}

export default App;
