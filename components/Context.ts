import React, { createContext, useState } from 'react';

export const UserContext = createContext({
    isLoggedIn: false,
    authToken: '',
    login: (token?: string) => { },
    logout: () => { }
});
