import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWallet } from '../slice/workerSlice';
import { createSettlementApi, getWithdrawalsApi } from '../services/workerAPI';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  approved: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  pending:  { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  rejected: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
};

const SettlementPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallet } = useSelector((s) => s.worker);
  const { user } = useSelector((s) => s.auth);
  const lang = user?.language || 'en';

  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchWallet());
    setLoading(true);
    getWithdrawalsApi()
      .then((res) => setSettlements(res.data?.data || []))
      .catch(() => setSettlements([]))
      .finally(() => setLoading(false));
  }, [dispatch]);

  const cashDue = parseFloat(wallet?.cash_in_hand_due || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (amt > cashDue) { toast.error('Amount exceeds cash due'); return; }
    setSubmitting(true);
    try {
      await createSettlementApi({ amount: amt });
      toast.success(lang === 'ml' ? 'സെറ്റിൽമെന്റ് സമർപ്പിച്ചു!' : 'Settlement request submitted!');
      setAmount('');
      // Refresh list
      const res = await getWithdrawalsApi();
      setSettlements(res.data?.data || []);
      dispatch(fetchWallet());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
          {lang === 'ml' ? 'ക്യാഷ് സെറ്റിൽമെന്റ്' : 'Cash Settlement'}
        </h1>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Cash Due Banner */}
        <div style={{
          borderRadius: 16, padding: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: cashDue > 0 ? '#fff7ed' : '#f0fdf4',
          border: `1px solid ${cashDue > 0 ? '#fed7aa' : '#bbf7d0'}`,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', marginBottom: 4 }}>
              {lang === 'ml' ? 'ക്യാഷ് ബാക്കി' : 'Cash In Hand Due'}
            </p>
            <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: cashDue > 0 ? '#c2410c' : '#15803d' }}>
              ₹{cashDue.toFixed(2)}
            </p>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 44, color: cashDue > 0 ? '#fb923c' : '#4ade80', fontVariationSettings: "'FILL' 1" }}>
            {cashDue > 0 ? 'warning' : 'check_circle'}
          </span>
        </div>

        {/* Settlement Form (only if cash is due) */}
        {cashDue > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 16 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
              {lang === 'ml' ? 'ക്യാഷ് ഹ്യൻഡ് ഓവർ' : 'Submit Cash Handover'}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Amount input */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                  {lang === 'ml' ? 'തുക' : 'Amount'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 500 }}>₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={cashDue}
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    style={{ width: '100%', paddingLeft: 28, paddingRight: 12, paddingTop: 12, paddingBottom: 12, border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 16, fontWeight: 700, boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAmount(String(cashDue))}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary,#1d4ed8)', fontSize: 12, cursor: 'pointer', padding: 0, marginBottom: 14 }}
              >
                {lang === 'ml' ? 'പൂർണ്ണ തുക: ₹' : 'Use full amount: ₹'}{cashDue.toFixed(2)}
              </button>

              <button
                type="submit"
                disabled={submitting || !amount}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12,
                  background: 'var(--color-primary,#1d4ed8)', color: '#fff',
                  border: 'none', fontSize: 14, fontWeight: 700,
                  cursor: submitting || !amount ? 'not-allowed' : 'pointer',
                  opacity: submitting || !amount ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxSizing: 'border-box',
                }}
              >
                {submitting && <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                {lang === 'ml' ? 'അഭ്യർത്ഥന സമർപ്പിക്കുക' : 'Submit Settlement Request'}
              </button>
            </form>
          </div>
        )}

        {/* Settlement History */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
              {lang === 'ml' ? 'ചരിത്രം' : 'Settlement History'}
            </h2>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{settlements.length} records</span>
          </div>

          {loading ? (
            <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 24, height: 24, border: '2px solid #e2e8f0', borderTop: '2px solid var(--color-primary,#1d4ed8)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : settlements.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                {lang === 'ml' ? 'ഇല്ല' : 'No settlements yet'}
              </p>
            </div>
          ) : (
            settlements.map((s) => {
              const st = STATUS_STYLE[s.status] || STATUS_STYLE.pending;
              return (
                <div key={s.withdrawal_id || s.settlement_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>₹{parseFloat(s.amount).toFixed(2)}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                      {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{
                    padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: st.bg, color: st.color, border: `1px solid ${st.border}`, textTransform: 'capitalize',
                  }}>
                    {s.status}
                  </span>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default SettlementPage;
