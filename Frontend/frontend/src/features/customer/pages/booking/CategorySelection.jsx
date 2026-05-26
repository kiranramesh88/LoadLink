import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setDraftWorkType } from '../../slice/customerSlice';

const categories = [
    {
        id: 'shop_unloading',
        title: 'Shop / Textile Unloading',
        icon: 'inventory_2',
        desc: 'Heavy lifting and moving of textile bales, fabric rolls, and bulk clothing shipments.'
    },
    {
        id: 'warehouse',
        title: 'Wholesale / Warehouse',
        icon: 'warehouse',
        desc: 'Loading, unloading, and organizing pallets of wholesale merchandise and consumer goods.'
    },
    {
        id: 'market_loading',
        title: 'Vegetable Market',
        icon: 'storefront',
        desc: 'Handling, sorting, and rapid transport of fresh produce and perishable goods.'
    },
    {
        id: 'construction',
        title: 'Construction Material',
        icon: 'engineering',
        desc: 'Moving heavy construction supplies, cement bags, bricks, and organizing site materials.'
    },
    {
        id: 'household_shifting',
        title: 'Household Shifting',
        icon: 'house',
        desc: 'Careful packing, loading, moving, and unloading of delicate household furniture and items.'
    },
    {
        id: 'other',
        title: 'Other Labor',
        icon: 'handyman',
        desc: 'General labor, miscellaneous physical tasks, and flexible on-demand workforce needs.'
    },
];

const CategorySelection = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSelect = (categoryId) => {
        dispatch(setDraftWorkType(categoryId));
        navigate('/customer/booking/details');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease' }}>
            {/* Headline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-on-background, #111c2d)', maxWidth: '700px', margin: 0, lineHeight: 1.2 }}>
                    What kind of work do you need help with?
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--color-on-surface-variant, #434656)', maxWidth: '600px', margin: 0 }}>
                    Choose the category that best fits your labor requirements to help us match you with the right team.
                </p>
            </div>

            {/* Category Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '12px',
                            border: '1px solid #c3c5d9',
                            background: '#fff',
                            padding: '24px',
                            transition: 'all 0.2s ease',
                            cursor: 'default',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(17,28,45,0.12)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.borderColor = '#003ec7';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = '#c3c5d9';
                        }}
                    >
                        {/* Icon */}
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '10px',
                            background: '#e7eeff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', marginBottom: '16px', color: '#003ec7'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                        </div>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111c2d', margin: '0 0 8px 0' }}>{cat.title}</h2>
                        <p style={{ fontSize: '14px', color: '#434656', margin: '0 0 20px 0', lineHeight: 1.5, flex: 1 }}>{cat.desc}</p>
                        <button
                            onClick={() => handleSelect(cat.id)}
                            style={{
                                width: '100%', padding: '10px 16px', borderRadius: '8px',
                                border: '1px solid #c3c5d9', background: '#fff',
                                color: '#003ec7', fontWeight: 600, fontSize: '14px',
                                cursor: 'pointer', transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = '#e7eeff';
                                e.currentTarget.style.borderColor = '#003ec7';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.borderColor = '#c3c5d9';
                            }}
                        >
                            Select
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySelection;
