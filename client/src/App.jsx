import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header.jsx';
import Landing from './Landing.jsx';
import Dashboard from './Dashboard.jsx';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';
import './App.css';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = () => {
        axios.get('/api/current_user')
            .then(res => {
                setUser(res.data || null);
                setLoading(false);
            })
            .catch(() => {
                setUser(null);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await axios.post('/api/logout');
        setUser(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <BrowserRouter>
            <div className="container">
                <Header user={user} onLogout={handleLogout} />
                <main>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<LoginPage onLogin={fetchUser} />} />
                        <Route path="/register" element={<RegisterPage onRegister={fetchUser} />} />
                        <Route
                            path="/dashboard"
                            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
                        />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
