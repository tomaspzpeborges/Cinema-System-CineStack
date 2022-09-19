import React, { useState, useContext, createContext, useEffect } from 'react';
import axios from 'axios';

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
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('jwt-user'))
    );
    const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwt-token'));

    const signin = (email, password) => {
        return axios
            .post(
                '/api/v1/customer/login',
                JSON.stringify({
                    email: email,
                    password: password,
                })
            )
            .then((response) => {
                setJwtToken(response.data.token);
                localStorage.setItem('jwt-token', response.data.token);
                return axios
                    .get('/api/v1/customer/profile', {
                        headers: {
                            Authorization: `Bearer ${response.data.token}`,
                        },
                    })
                    .then((user) => {
                        setUser(user.data.customer);
                        localStorage.setItem(
                            'jwt-user',
                            JSON.stringify(user.data.customer)
                        );
                        return {
                            jwtToken: response.data.token,
                            user: user.data.customer,
                        };
                    });
            });
    };

    const signup = (name, dob, email, password) => {
        return axios
            .post(
                '/api/v1/customer/register',
                JSON.stringify({ name, dob, email, password })
            )
            .then(() => ({ error: null }))
            .catch((e) => ({ error: e.response.data.reason }));
    };

    const signout = () => {
        setUser(null);
        setJwtToken(null);
    };

    const verifyAccount = (id, token) => {
        return axios
            .get(`/api/v1/customer/verify/${id}/${token}`)
            .then(() => true)
            .catch(() => false);
    };

    const sendPasswordResetEmail = (email) => {
        return axios
            .post('/api/v1/customer/passreset', JSON.stringify({ email }))
            .then(() => ({ error: null }))
            .catch((e) => ({ error: e.response.data.reason }));
    };

    const resetPassword = (code, password) => {
        return axios
            .post(
                `/api/v1/customer/passreset/${code}`,
                JSON.stringify({ password })
            )
            .then(() => ({ error: null }))
            .catch((e) => ({ error: e.response.data.reason }));
    };

    // on first mount, retrieve updated user object and logout if fail
    useEffect(() => {
        axios
            .get('/api/v1/customer/profile', {
                headers: { Authorization: `Bearer ${jwtToken}` },
            })
            .then((res) => {
                setUser(JSON.stringify(res.data.customer));
            })
            .catch(() => {
                setUser(null);
                setJwtToken(null);
            });
    }, []);

    // Return the user object and auth methods
    return {
        user,
        jwtToken,
        signin,
        signup,
        signout,
        verifyAccount,
        sendPasswordResetEmail,
        resetPassword,
    };
}
