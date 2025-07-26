import React, { useState, useEffect } from 'react';
import axios from 'axios';

const mainAccountTypes = ['Asset', 'Liabilities', 'Equity', 'Revenue'];

const Dashboard = ({ user }) => {
    const [accounts, setAccounts] = useState([]);
    const [formState, setFormState] = useState({
        account_id: '',
        name: '',
        main_account_type: 'Asset',
        main_account_category: '',
        notes: '',
        balance: ''
    });
    const [editId, setEditId] = useState(null);
    const [formError, setFormError] = useState('');
    const [mode, setMode] = useState('add'); // 'add' or 'update'

    useEffect(() => {
        if (user) {
            axios.get('/api/accounts').then(res => setAccounts(res.data));
        }
    }, [user]);

    const handleFormChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!formState.name.trim() || !formState.main_account_category.trim()) {
            setFormError('Account name and category are required.');
            return;
        }

        const payload = { ...formState, balance: parseFloat(formState.balance) || 0 };
        const existingAccount = accounts.find(a => a.account_id === payload.account_id && payload.account_id);

        try {
            let res;
            if (mode === 'update') {
                if (!existingAccount) {
                    setFormError('No account found with that ID to update.');
                    return;
                }
                res = await axios.put(`/api/accounts/${existingAccount._id}`, payload);
                setAccounts(accounts.map(a => a._id === existingAccount._id ? res.data : a));
            } else {
                res = await axios.post('/api/accounts', payload);
                setAccounts([...accounts, res.data]);
            }
            // Reset form
            setFormState({
                account_id: '', name: '', main_account_type: 'Asset', main_account_category: '',
                notes: '', balance: ''
            });
        } catch (error) {
            setFormError('Failed to save account. Please check the console for details.');
            console.error(error.response ? error.response.data : error);
        }
    };

    const handleEdit = (account) => {
        setFormState({
            account_id: account.account_id || '',
            name: account.name || '',
            main_account_type: account.main_account_type || 'Asset',
            main_account_category: account.main_account_category || '',
            notes: account.notes || '',
            balance: account.balance || ''
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this account?')) return;
        try {
            await axios.delete(`/api/accounts/${id}`);
            setAccounts(accounts.filter(a => a._id !== id));
        } catch (error) {
            setFormError('Failed to delete account.');
        }
    };
    
    // Calculated fields
    const total_assets = accounts.filter(a => a.main_account_type === 'Asset').reduce((sum, a) => sum + (a.balance || 0), 0);
    const total_liabilities = accounts.filter(a => a.main_account_type === 'Liabilities').reduce((sum, a) => sum + (a.balance || 0), 0);
    const total_equity = accounts.filter(a => a.main_account_type === 'Equity').reduce((sum, a) => sum + (a.balance || 0), 0);
    const total_revenue = accounts.filter(a => a.main_account_type === 'Revenue').reduce((sum, a) => sum + (a.balance || 0), 0);
    const net_worth = total_assets - total_liabilities;
    const accounting_equation_check = (total_assets === total_liabilities + total_equity);

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 0' }}>
            <h2 style={{ color: '#357abd', fontWeight: 700, marginBottom: 8 }}>Dashboard</h2>
            {user && <p style={{ marginBottom: 32 }}>Welcome, <b>{user.username}</b>!</p>}

            {/* Summary Section */}
            <div style={{ background: '#fff', border: '2px solid #4a90e2', borderRadius: 16, padding: 24, boxShadow: '0 4px 16px rgba(74,144,226,0.10)', maxWidth: 600, marginBottom: 32 }}>
                <h3 style={{marginTop: 0, color: '#357abd', fontWeight: 700, marginBottom: 20}}>Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: '#f4f7f6', borderRadius: 8, padding: 12, fontWeight: 500 }}>Total Assets: <span style={{ float: 'right' }}>${total_assets.toLocaleString()}</span></div>
                    <div style={{ background: '#f4f7f6', borderRadius: 8, padding: 12, fontWeight: 500 }}>Total Liabilities: <span style={{ float: 'right' }}>${total_liabilities.toLocaleString()}</span></div>
                    <div style={{ background: '#f4f7f6', borderRadius: 8, padding: 12, fontWeight: 500 }}>Total Equity: <span style={{ float: 'right' }}>${total_equity.toLocaleString()}</span></div>
                    <div style={{ background: '#f4f7f6', borderRadius: 8, padding: 12, fontWeight: 500 }}>Total Revenue: <span style={{ float: 'right' }}>${total_revenue.toLocaleString()}</span></div>
                    <div style={{ background: '#f4f7f6', borderRadius: 8, padding: 12, fontWeight: 500 }}>Net Worth: <span style={{ float: 'right' }}>${net_worth.toLocaleString()}</span></div>
                    <div style={{ background: '#f4f7f6', borderRadius: 8, padding: 12, fontWeight: 500 }}>
                        Accounting Equation: {total_assets} = {total_liabilities} + {total_equity}
                        <span style={{ float: 'right', color: accounting_equation_check ? 'green' : 'red', fontWeight: 700 }}>
                            {accounting_equation_check ? 'Balanced' : 'Not Balanced'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div style={{ background: '#fff', border: '1.5px solid #e0e7ef', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(74,144,226,0.06)', maxWidth: 600, marginBottom: 32 }}>
                <h3 style={{ color: '#357abd', fontWeight: 700, marginTop: 0, marginBottom: 20 }}>Add or Update Account</h3>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                    <button type="button" onClick={() => setMode('add')} style={{ background: mode === 'add' ? '#4a90e2' : '#e0e7ef', color: mode === 'add' ? '#fff' : '#357abd', fontWeight: 700, border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 15, cursor: 'pointer' }}>Add Account</button>
                    <button type="button" onClick={() => setMode('update')} style={{ background: mode === 'update' ? '#4a90e2' : '#e0e7ef', color: mode === 'update' ? '#fff' : '#357abd', fontWeight: 700, border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 15, cursor: 'pointer' }}>Update Account</button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {formError && <div style={{color: 'red', marginBottom: 8}}>{formError}</div>}
                    {Object.keys(formState).map(key => (
                        key !== 'balance' && <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontWeight: 500 }}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                            {key === 'main_account_type' ? (
                                <select name={key} value={formState[key]} onChange={handleFormChange} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #b0b8c1', fontSize: 15 }}>
                                    {mainAccountTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            ) : (
                                <input type="text" name={key} value={formState[key]} onChange={handleFormChange} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #b0b8c1', fontSize: 15 }} />
                            )}
                        </div>
                    ))}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontWeight: 500 }}>Balance</label>
                        <input type="number" name="balance" value={formState.balance} onChange={handleFormChange} required style={{ padding: 8, borderRadius: 6, border: '1.5px solid #b0b8c1', fontSize: 15 }} />
                    </div>
                    <button type="submit" style={{ background: '#4a90e2', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 16, marginTop: 8, cursor: 'pointer' }}>{mode === 'add' ? 'Add Account' : 'Update Account'}</button>
                </form>
            </div>

            <h3 style={{ color: '#357abd', fontWeight: 700, marginTop: 32 }}>Your Accounts</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', background: 'white', borderRadius: 8, marginTop: 16, borderCollapse: 'collapse', fontSize: 15 }}>
                    <thead>
                        <tr style={{ background: '#f4f7f6', color: '#357abd', fontWeight: 700 }}>
                            <th style={{ padding: 10, borderBottom: '2px solid #e0e7ef' }}>ID</th>
                            <th style={{ padding: 10, borderBottom: '2px solid #e0e7ef' }}>Name</th>
                            <th style={{ padding: 10, borderBottom: '2px solid #e0e7ef' }}>Type</th>
                            <th style={{ padding: 10, borderBottom: '2px solid #e0e7ef' }}>Category</th>
                            <th style={{ padding: 10, borderBottom: '2px solid #e0e7ef' }}>Notes</th>
                            <th style={{ padding: 10, borderBottom: '2px solid #e0e7ef' }}>Balance</th>
                            <th style={{ padding: 10, borderBottom: '2px solid #e0e7ef' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(account => (
                            <tr key={account._id} style={{ borderBottom: '1px solid #e0e7ef' }}>
                                <td style={{ padding: 10 }}>{account.account_id}</td>
                                <td style={{ padding: 10 }}>{account.name}</td>
                                <td style={{ padding: 10 }}>{account.main_account_type}</td>
                                <td style={{ padding: 10 }}>{account.main_account_category}</td>
                                <td style={{ padding: 10 }}>{account.notes}</td>
                                <td style={{ padding: 10 }}>${Number(account.balance).toLocaleString()}</td>
                                <td style={{ padding: 10 }}>
                                    <button onClick={() => handleEdit(account)} style={{ background: '#e0e7ef', color: '#357abd', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(account._id)} style={{ background: '#fff', color: 'red', border: '1.5px solid #e0e7ef', borderRadius: 6, padding: '6px 12px', fontWeight: 600, marginLeft: 8, cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard; 