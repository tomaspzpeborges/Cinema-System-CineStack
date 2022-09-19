/* eslint-disable no-unused-vars */
import React, { useState, useContext, createContext, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';

const authContext = createContext();

export function AuthProvider(props) {
    const auth = useProvideAuth();
    return (
        <authContext.Provider value={auth}>
            {props.children}
        </authContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(authContext);
};

function useProvideAuth() {
    const [userToken, setUserToken] = useState(
        localStorage.getItem('user-jwt')
    );
    const [user, setUser] = useState({});

    const signin = (email, password) => {
        return axios
            .post(
                '/api/v1/staff/login',
                qs.stringify({
                    username: email,
                    password: password
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            )
            .then((response) => {
                setUserToken(response.data.token);
                setUser(response.data.user);
                localStorage.setItem('user-jwt', response.data.token);
                localStorage.setItem('user-id', response.data.user._id);
            });
    };

    const signout = () => {
        setUserToken(null);
        localStorage.removeItem('user-jwt');
        localStorage.removeItem('user-id');
    };

    return {
        userToken,
        user,
        signin,
        signout
    }
}