import React, { createContext, useState, useContext } from 'react';


const SmsContentContext = createContext();

export const SmsContentProvider = ({ children }) => {
    const [smsContent, setSmsContent] = useState('');
    return (
        <SmsContentContext.Provider value={{ smsContent, setSmsContent }}>
            {children}
        </SmsContentContext.Provider>
    );
};

export const useSmsContent = () => useContext(SmsContentContext);
