import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestionnaire, setDraftAnswers } from '../../slice/customerSlice';

// Fallback questions if backend has no questionnaire for a work type
const FALLBACK_QUESTIONS = [
    { question_id: 'estimated_weight', question: 'Approximately how much weight needs to be moved? (in kg)', field_type: 'number' },
    { question_id: 'num_items', question: 'How many individual items or packages are involved?', field_type: 'number' },
    { question_id: 'floor_level', question: 'Which floor level is the work at?', field_type: 'single_choice', options: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor+'] },
    { question_id: 'has_elevator', question: 'Is an elevator/lift available at the site?', field_type: 'boolean' },
    { question_id: 'special_instructions', question: 'Any special instructions or notes for the workers?', field_type: 'text' },
];

const DynamicQuestionnaire = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { draftBooking, loading } = useSelector((state) => state.customer);
    const [localAnswers, setLocalAnswers] = useState({});

    useEffect(() => {
        if (!draftBooking.work_type) {
            navigate('/customer/booking/category');
            return;
        }
        dispatch(fetchQuestionnaire(draftBooking.work_type));
    }, [draftBooking.work_type, dispatch, navigate]);

    useEffect(() => {
        if (draftBooking.answers) {
            setLocalAnswers(draftBooking.answers);
        }
    }, [draftBooking.answers]);

    const handleAnswerChange = (questionId, value) => {
        setLocalAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleContinue = () => {
        dispatch(setDraftAnswers(localAnswers));
        navigate('/customer/booking/location');
    };

    // Use backend questionnaire if available, otherwise fallback
    const questions = (draftBooking.questionnaire?.length > 0)
        ? draftBooking.questionnaire
        : FALLBACK_QUESTIONS;

    const categoryLabels = {
        shop_unloading: 'Shop / Textile Unloading',
        market_loading: 'Vegetable Market Loading',
        household_shifting: 'Household Shifting',
        construction: 'Construction Material',
        warehouse: 'Wholesale / Warehouse',
        other: 'Other Labor',
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid #e7eeff', borderTop: '4px solid #003ec7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }}></div>
                <p style={{ color: '#434656' }}>Loading questionnaire...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Progress Tracker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px', maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#003ec7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step 2 of 3</span>
                    <span style={{ fontSize: '11px', color: '#434656' }}>Work Details</span>
                </div>
                <div style={{ height: '6px', borderRadius: '999px', background: '#d8e3fb', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '66%', borderRadius: '999px', background: '#003ec7', transition: 'width 0.4s ease' }}></div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {/* Left Column: Form */}
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111c2d', margin: '0 0 8px 0' }}>
                            Tell us about the job
                        </h1>
                        <p style={{ fontSize: '16px', color: '#434656', margin: 0 }}>
                            Category: <strong>{categoryLabels[draftBooking.work_type] || draftBooking.work_type}</strong>
                        </p>
                    </div>

                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #c3c5d9', boxShadow: '0 2px 8px rgba(17,28,45,0.04)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        {questions.map((q) => {
                            // Support both backend field names and fallback field names
                            const qId = q.question_id || q.id;
                            const qText = q.question || q.question_text;
                            const qType = q.field_type || q.question_type;
                            const qOptions = Array.isArray(q.options) ? q.options : (q.options?.choices || []);

                            return (
                                <div key={qId} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '15px', fontWeight: 600, color: '#111c2d' }}>{qText}</label>

                                    {/* Number Input */}
                                    {qType === 'number' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input
                                                type="range" min="1" max="1000"
                                                value={localAnswers[qId] || 50}
                                                onChange={(e) => handleAnswerChange(qId, e.target.value)}
                                                style={{ accentColor: '#003ec7', width: '100%' }}
                                            />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                    type="number"
                                                    value={localAnswers[qId] || ''}
                                                    onChange={(e) => handleAnswerChange(qId, e.target.value)}
                                                    placeholder="Enter value"
                                                    style={{ width: '100px', padding: '8px 12px', border: '1px solid #c3c5d9', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                                                    onFocus={e => e.target.style.borderColor = '#003ec7'}
                                                    onBlur={e => e.target.style.borderColor = '#c3c5d9'}
                                                />
                                                <span style={{ color: '#434656', fontSize: '14px' }}>units</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Single / Multiple Choice */}
                                    {(qType === 'single_choice' || qType === 'multiple_choice' || qType === 'choice') && (
                                        <select
                                            value={localAnswers[qId] || ''}
                                            onChange={(e) => handleAnswerChange(qId, e.target.value)}
                                            style={{ padding: '10px 12px', border: '1px solid #c3c5d9', borderRadius: '8px', fontSize: '14px', background: '#f9f9ff', color: '#111c2d', outline: 'none' }}
                                        >
                                            <option value="">Select an option</option>
                                            {qOptions.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    )}

                                    {/* Boolean (Yes/No) */}
                                    {qType === 'boolean' && (
                                        <div style={{ display: 'flex', background: '#e7eeff', padding: '4px', borderRadius: '10px' }}>
                                            {['Yes', 'No'].map((opt) => {
                                                const val = opt === 'Yes' ? 'true' : 'false';
                                                const active = localAnswers[qId] === val;
                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => handleAnswerChange(qId, val)}
                                                        style={{
                                                            flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                                                            background: active ? '#fff' : 'transparent',
                                                            color: active ? '#003ec7' : '#434656',
                                                            fontWeight: active ? 700 : 400,
                                                            boxShadow: active ? '0 1px 4px rgba(17,28,45,0.1)' : 'none',
                                                            cursor: 'pointer', fontSize: '14px', transition: 'all 0.15s ease'
                                                        }}
                                                    >{opt}</button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Text Input */}
                                    {qType === 'text' && (
                                        <input
                                            type="text"
                                            value={localAnswers[qId] || ''}
                                            onChange={(e) => handleAnswerChange(qId, e.target.value)}
                                            placeholder="Enter details..."
                                            style={{ padding: '10px 12px', border: '1px solid #c3c5d9', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#f9f9ff' }}
                                            onFocus={e => e.target.style.borderColor = '#003ec7'}
                                            onBlur={e => e.target.style.borderColor = '#c3c5d9'}
                                        />
                                    )}
                                </div>
                            );
                        })}

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #e7eeff' }}>
                            <button
                                onClick={() => navigate(-1)}
                                style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #c3c5d9', background: '#fff', color: '#111c2d', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                            >Back</button>
                            <button
                                onClick={handleContinue}
                                style={{ padding: '10px 32px', borderRadius: '8px', border: 'none', background: '#003ec7', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,62,199,0.3)' }}
                            >Continue →</button>
                        </div>
                    </div>
                </div>

                {/* Right: Smart Banner */}
                <div style={{ width: '280px', flexShrink: 0 }}>
                    <div style={{ background: 'linear-gradient(135deg, #e7eeff 0%, #f0f3ff 100%)', borderRadius: '12px', padding: '24px', border: '1px solid #b7c4ff', position: 'sticky', top: '96px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#003ec7', fontWeight: 700 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>lightbulb</span>
                            <span style={{ fontSize: '16px' }}>Smart Estimate</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#434656', lineHeight: 1.6, margin: 0 }}>
                            Our system uses your answers to instantly calculate the required number of workers, expected time, and cost.
                            <br /><br />
                            Try to be as accurate as possible to avoid discrepancies at the site.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicQuestionnaire;
