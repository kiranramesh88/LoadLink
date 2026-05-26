import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const BookingLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current step based on path
    const getStep = () => {
        if (location.pathname.includes('category')) return 1;
        if (location.pathname.includes('details')) return 2;
        if (location.pathname.includes('location')) return 3;
        return 1;
    };
    
    const step = getStep();

    const handleClose = () => {
        navigate('/customer/dashboard');
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col items-center font-body-md">
            <div className="w-full max-w-5xl flex flex-col flex-1 pb-12">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-outline-variant px-8 py-4 bg-surface-container-lowest sticky top-0 z-10 rounded-b-xl shadow-sm mb-4">
                    <div className="flex items-center gap-4 text-on-background">
                        <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 rounded-full hover:bg-surface-container transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-title-lg text-on-background">Create Request</h2>
                    </div>
                    <button onClick={handleClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-background">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </header>

                {/* Main Content Area */}
                <main className="flex flex-col flex-1 px-8 pt-4">
                    {/* Progress Tracker (Only show on step 1) */}
                    {step === 1 && (
                        <div className="flex flex-col gap-3 mb-10 max-w-2xl">
                            <div className="flex justify-between items-end">
                                <p className="text-on-background text-label-md uppercase tracking-widest text-primary">Step 1 of 3</p>
                                <p className="text-on-surface-variant text-label-sm">Category Selection</p>
                            </div>
                            <div className="rounded-full bg-surface-variant h-2 w-full overflow-hidden">
                                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: '33%' }}></div>
                            </div>
                        </div>
                    )}
                    
                    {/* For Step 2 and 3, they have their own progress headers in the template, so we will handle them in those specific components or we can unify them here. 
                        Let's keep the layout simple and let Outlet render the specific components. */}

                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BookingLayout;
