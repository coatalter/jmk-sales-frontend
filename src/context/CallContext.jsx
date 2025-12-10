import React, { createContext, useContext, useState } from "react";
import CallInterface from "../components/CallInterface"; 

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [activeCustomer, setActiveCustomer] = useState(null);
  
  // STATE BARU: Sinyal untuk refresh data tabel
  const [refreshSignal, setRefreshSignal] = useState(0);

  const startCall = (customer) => {
    setActiveCustomer(customer);
  };

  const endCall = () => {
    setActiveCustomer(null);
  };

  // Fungsi untuk memicu refresh di halaman lain
  const triggerRefresh = () => {
    setRefreshSignal(prev => prev + 1);
  };

  return (
    <CallContext.Provider value={{ startCall, endCall, activeCustomer, refreshSignal, triggerRefresh }}>
      {children}
      
      {activeCustomer && (
        <CallInterface 
          customer={activeCustomer} 
          onClose={endCall}
          onSave={triggerRefresh} 
        />
      )}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};
