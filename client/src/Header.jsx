import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
    const renderContent = () => {
        if (user) {
            return (
                <li><button onClick={onLogout}>Logout</button></li>
            );
        } else {
            return (
                <>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/register">Register</Link></li>
                </>
            );
        }
    };

    return (
        <nav>
            <Link to={user ? '/dashboard' : '/'} className="brand-logo">
                FinanceApp
            </Link>
            <ul>
                {renderContent()}
            </ul>
        </nav>
    );
};

export default Header; 