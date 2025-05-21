import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch,
} from 'react-router-dom';
import Users from './user/pages/Users';
import NewPlace from './places/pages/NewPlace';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';

const App = () => {
    const [token, setToken] = useState(false);
    const [userId, setUser] = useState(null);
    const [expirationDateToken, setExpirationDateToken] = useState();
    const logoutTimer = useRef();

    const login = useCallback((userId, token, expirationDate) => {
        setToken(token);
        setUser(userId);

        const expiresToken =
            expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);

        setExpirationDateToken(expiresToken);
        localStorage.setItem(
            'userData',
            JSON.stringify({
                userId,
                token,
                expiration: expiresToken.toISOString(),
            })
        );
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('userData');
    }, []);

    useEffect(() => {
        if (token && expirationDateToken) {
            const remainingTime =
                expirationDateToken.getTime() - new Date().getTime();

            logoutTimer.current = setTimeout(logout, remainingTime);
        } else {
            if (logoutTimer.current) {
                clearTimeout(logoutTimer.current);
            }
        }
    }, [token, logout, expirationDateToken]);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (
            userData &&
            userData.token &&
            new Date(userData.expiration) > new Date()
        ) {
            login(
                userData.userId,
                userData.token,
                new Date(userData.expiration)
            );
        }
    }, [login]);

    let routes;

    if (token) {
        routes = (
            <Switch>
                <Route path="/" exact>
                    <Users />
                </Route>
                <Route path="/:userId/places" exact>
                    <UserPlaces />
                </Route>
                <Route path="/places/new" exact>
                    <NewPlace />
                </Route>
                <Route path="/places/:placeId">
                    <UpdatePlace />
                </Route>
                <Redirect to="/" />
            </Switch>
        );
    } else {
        routes = (
            <Switch>
                <Route path="/" exact>
                    <Users />
                </Route>
                <Route path="/:userId/places" exact>
                    <UserPlaces />
                </Route>
                <Route path="/auth">
                    <Auth />
                </Route>
                <Redirect to="/auth" />
            </Switch>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: Boolean(token),
                token: token,
                userId: userId,
                login: login,
                logout: logout,
            }}
        >
            <Router>
                <MainNavigation />
                <main>{routes}</main>
            </Router>
        </AuthContext.Provider>
    );
};

export default App;
