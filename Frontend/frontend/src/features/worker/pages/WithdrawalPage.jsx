import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createWithdrawal, fetchWallet } from '../slice/workerSlice';

const WithdrawalPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallet, actionLoading } = useSelector((s) => s.worker);
  const { user } = useSelector((s) => s.auth);
  const lang = user?.language || 'en';

  const [form, setForm] = useState({
    amount: '',
    account_holder_name: user?.full_name || '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
    remarks: '',
  });
  const [method, setMethod] = useState('bank');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  const available = parseFloat(wallet?.available_balance || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt)) errs.amount = 'Enter a valid amount';
    else if (amt < 500) errs.amount = 'Minimum withdrawal is ₹500';
    else if (amt > available) errs.amount = 'Exceeds available balance';
    if (!form.account_holder_name.trim()) errs.account_holder_name = 'Required';
    if (method === 'bank') {
      if (!form.bank_name.trim()) errs.bank_name = 'Required';
      if (!form.account_number.trim()) errs.account_number = 'Required';
      if (!form.ifsc_code.trim()) errs.ifsc_code = 'Required';
    } else {
      if (!form.upi_id.trim()) errs.upi_id = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(createWithdrawal(form));
    if (!result.error) navigate('/worker/wallet');
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    border: `1px solid ${hasError ? '#f87171' : '#e2e8f0'}`,
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
    color: '#0f172a',
    background: '#fff',
  });

  const Field = ({ label, name, type = 'text', placeholder, required }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        style={inputStyle(!!errors[name])}
      />
      {errors[name] && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#ef4444' }}>{errors[name]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
          {lang === 'ml' ? 'പണം ഡ്രോ ചെയ്യുക' : 'Withdraw Funds'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Balance Banner */}
        <div style={{ background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.2)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
              {lang === 'ml' ? 'ലഭ്യമായ ബാലൻസ്' : 'Available Balance'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 800, color: 'var(--color-primary,#1d4ed8)' }}>
              ₹{available.toFixed(2)}
            </p>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-primary,#1d4ed8)', opacity: 0.6, fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
        </div>

        {/* Amount Card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
            {lang === 'ml' ? 'ഡ്രോ ചെയ്യേണ്ട തുക' : 'Amount to Withdraw'}
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 500 }}>₹</span>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="500"
              step="0.01"
              style={{
                ...inputStyle(!!errors.amount),
                paddingLeft: 28,
                fontSize: 18,
                fontWeight: 700,
              }}
            />
          </div>
          {errors.amount && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444' }}>{errors.amount}</p>}
          <p style={{ margin: '4px 0 8px', fontSize: 11, color: '#94a3b8' }}>Minimum: ₹500</p>

          {/* Quick amount buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            {[500, 1000, 2000, 5000].map((amt) => (
              <button
                type="button"
                key={amt}
                disabled={amt > available}
                onClick={() => setForm((f) => ({ ...f, amount: String(amt) }))}
                style={{
                  padding: '6px 4px', borderRadius: 8,
                  border: form.amount === String(amt) ? '2px solid var(--color-primary,#1d4ed8)' : '1px solid #e2e8f0',
                  background: form.amount === String(amt) ? 'rgba(29,78,216,0.06)' : '#f8fafc',
                  fontSize: 12, fontWeight: 500,
                  color: form.amount === String(amt) ? 'var(--color-primary,#1d4ed8)' : '#64748b',
                  cursor: amt > available ? 'not-allowed' : 'pointer',
                  opacity: amt > available ? 0.4 : 1,
                }}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method Card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
            {lang === 'ml' ? 'പേയ്‌മെന്റ് രീതി' : 'Payment Method'}
          </p>

          {/* Method toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { key: 'bank', icon: 'account_balance', label: 'Bank Transfer' },
              { key: 'upi', icon: 'payments', label: 'UPI' },
            ].map((m) => (
              <button
                type="button"
                key={m.key}
                onClick={() => setMethod(m.key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px', borderRadius: 10,
                  border: method === m.key ? '2px solid var(--color-primary,#1d4ed8)' : '2px solid #e2e8f0',
                  background: method === m.key ? 'rgba(29,78,216,0.06)' : '#fff',
                  color: method === m.key ? 'var(--color-primary,#1d4ed8)' : '#64748b',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Account Holder Name (always shown) */}
          <Field
            label={lang === 'ml' ? 'അക്കൌണ്ട് ഉടമ' : 'Account Holder Name'}
            name="account_holder_name"
            required
          />

          {method === 'bank' ? (
            <>
              <Field label="Bank Name" name="bank_name" required />
              <Field label="Account Number" name="account_number" type="text" required />
              <Field label="IFSC Code" name="ifsc_code" placeholder="e.g. SBIN0001234" required />
            </>
          ) : (
            <Field label="UPI ID" name="upi_id" placeholder="e.g. user@upi" required />
          )}

          <div style={{ marginTop: 4 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>
              {lang === 'ml' ? 'കുറിപ്പ്' : 'Remarks (optional)'}
            </label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={2}
              style={{ ...inputStyle(false), resize: 'none' }}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          Withdrawals are processed within 24–48 working hours after union approval.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={actionLoading}
          style={{
            width: '100%', padding: '14px', borderRadius: 14,
            background: 'var(--color-primary,#1d4ed8)', color: '#fff',
            border: 'none', fontSize: 15, fontWeight: 700,
            cursor: actionLoading ? 'not-allowed' : 'pointer',
            opacity: actionLoading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(29,78,216,0.3)',
            boxSizing: 'border-box',
          }}
        >
          {actionLoading ? (
            <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
          )}
          {lang === 'ml' ? 'അഭ്യർത്ഥന സമർപ്പിക്കുക' : 'Submit Withdrawal Request'}
        </button>

      </form>
    </div>
  );
};

export default WithdrawalPage;
