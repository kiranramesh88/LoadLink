import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchRequests, fetchCustomerProfile } from '../slice/customerSlice';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { requests, loading, customerProfile } = useSelector((state) => state.customer);

    useEffect(() => {
        dispatch(fetchRequests());
        dispatch(fetchCustomerProfile());
    }, [dispatch]);

    const handleNewRequest = () => {
        navigate('/customer/booking/category');
    };

    const activeRequest = requests.find(r => ['team_suggested', 'approved', 'workers_assigned', 'in_progress', 'payment_pending', 'workers_arrived', 'workers_on_the_way'].includes(r.status));

    const handleTrackActiveWork = () => {
        if (activeRequest) {
            navigate(`/customer/track/${activeRequest.request_id}`);
        } else {
            toast("No active operations to track");
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-xl flex flex-1 justify-center py-lg max-lg:px-md max-lg:py-md">
                    <div className="layout-content-container flex flex-col w-full max-w-[1440px] flex-1">
                        
                        {/* Header */}
                        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-outline-variant px-lg py-md bg-surface-container-lowest sticky top-0 z-10 rounded-b-xl mb-4 shadow-sm">
                            <div className="flex items-center gap-sm text-on-surface">
                                <div className="w-8 h-8 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">local_shipping</span>
                                </div>
                                <h2 className="text-on-surface text-title-lg tracking-[-0.015em]">LoadLink Customer</h2>
                            </div>
                            <div className="flex flex-1 justify-end gap-lg items-center">
                                <label className="flex flex-col min-w-40 !h-10 max-w-64 hidden sm:flex">
                                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-outline-variant bg-surface-container-lowest focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                                        <div className="text-on-surface-variant flex items-center justify-center pl-sm rounded-l-lg border-r-0">
                                            <span className="material-symbols-outlined text-[20px]">search</span>
                                        </div>
                                        <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-on-surface focus:outline-none focus:ring-0 border-none bg-transparent h-full placeholder:text-on-surface-variant px-sm text-body-md" placeholder="Search..." type="text" />
                                    </div>
                                </label>
                                <div className="flex gap-sm">
                                    <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors relative">
                                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"></span>
                                    </button>
                                </div>
                                <div className="bg-surface-container-high flex items-center justify-center rounded-full w-10 h-10 border border-outline-variant overflow-hidden text-primary font-bold">
                                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
                                </div>
                            </div>
                        </header>

                        <div className="flex flex-1 flex-col lg:flex-row w-full mt-lg gap-6">
                            
                            {/* Left Sidebar Navigation */}
                            <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-lg sticky top-[88px] h-[calc(100vh-88px)] hidden lg:flex">
                                <div className="flex flex-col gap-md bg-surface-container-lowest p-md rounded-lg border border-outline-variant shadow-sm">
                                    <div className="flex gap-sm items-center mb-sm">
                                        <div className="bg-surface-container-highest rounded-full w-12 h-12 border border-outline-variant flex items-center justify-center text-primary font-bold text-lg">
                                            {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'CU'}
                                        </div>
                                        <div className="flex flex-col">
                                            <h1 className="text-on-surface text-body-lg font-medium leading-tight">{user?.full_name || 'Customer'}</h1>
                                            <p className="text-on-surface-variant text-label-md">Operations Profile</p>
                                        </div>
                                    </div>
                                    <nav className="flex flex-col gap-1">
                                        <a className="flex items-center gap-sm px-sm py-2 rounded-md bg-primary-container text-on-primary-container" href="#">
                                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                                            <span className="text-label-md font-semibold">Dashboard</span>
                                        </a>
                                        <a className="flex items-center gap-sm px-sm py-2 rounded-md text-on-surface hover:bg-surface-container transition-colors" href="#" onClick={e => { e.preventDefault(); navigate('/customer/history'); }}>
                                            <span className="material-symbols-outlined text-[20px]">history</span>
                                            <span className="text-label-md">History</span>
                                        </a>
                                        <a className="flex items-center gap-sm px-sm py-2 rounded-md text-on-surface hover:bg-surface-container transition-colors" href="#" onClick={e => { e.preventDefault(); navigate('/customer/profile'); }}>
                                            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                                            <span className="text-label-md">Profile</span>
                                        </a>
                                    </nav>
                                </div>
                                <div className="mt-auto mb-md">
                                    <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant text-center">
                                        <span className="material-symbols-outlined text-[24px] text-primary mb-1">help_center</span>
                                        <p className="text-label-md text-on-surface mb-2">Need assistance?</p>
                                        <button className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-label-md py-1 rounded hover:bg-surface-container transition-colors">Contact Support</button>
                                    </div>
                                </div>
                            </aside>

                            {/* Main Content Area */}
                            <main className="flex-1 flex flex-col gap-lg min-w-0">
                                
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-on-surface text-headline-lg">Dashboard</h1>
                                    <p className="text-on-surface-variant text-body-lg">Manage your active workforce and operations.</p>
                                </div>

                                {/* Quick Actions */}
                                <section>
                                    <h2 className="text-on-surface text-title-lg mb-4">Quick Actions</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button onClick={handleNewRequest} className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant hover:border-primary hover:shadow-md transition-all group text-left cursor-pointer">
                                            <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <span className="material-symbols-outlined text-[24px]">person_add</span>
                                            </div>
                                            <div>
                                                <h3 className="text-on-surface text-body-lg font-semibold">Request Workers</h3>
                                                <p className="text-on-surface-variant text-label-md mt-1">Dispatch labor for new sites</p>
                                            </div>
                                        </button>
                                        <button onClick={handleTrackActiveWork} className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant hover:border-secondary hover:shadow-md transition-all group text-left cursor-pointer w-full">
                                            <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <span className="material-symbols-outlined text-[24px]">map</span>
                                            </div>
                                            <div>
                                                <h3 className="text-on-surface text-body-lg font-semibold">Track Active Work</h3>
                                                <p className="text-on-surface-variant text-label-md mt-1">View ongoing deployments</p>
                                            </div>
                                        </button>
                                        <button className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant hover:border-tertiary hover:shadow-md transition-all group text-left" onClick={() => navigate('/customer/quotes')}>
                                            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <span className="material-symbols-outlined text-[24px]">request_quote</span>
                                            </div>
                                            <div>
                                                <h3 className="text-on-surface text-body-lg font-semibold">View Quotes</h3>
                                                <p className="text-on-surface-variant text-label-md mt-1">Review pending estimates</p>
                                            </div>
                                        </button>
                                    </div>
                                </section>

                                {/* Main Grid Layout */}
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    {/* Left Column (Active Operations & History) */}
                                    <div className="xl:col-span-2 flex flex-col gap-6">
                                        
                                        {/* Active Operations */}
                                        <section className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden shadow-sm">
                                            <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-lowest">
                                                <h2 className="text-on-surface text-title-lg flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-[20px]">engineering</span>
                                                    Active Operations
                                                </h2>
                                                <button onClick={() => navigate('/customer/history')} className="text-primary text-label-md hover:underline cursor-pointer">View All</button>
                                            </div>
                                            <div className="p-4 flex flex-col gap-4 bg-surface">
                                                {loading ? (
                                                    <div className="animate-pulse h-32 bg-surface-container-high rounded-lg"></div>
                                                ) : requests.filter(r => ['team_suggested', 'approved', 'workers_assigned', 'in_progress', 'payment_pending'].includes(r.status)).length === 0 ? (
                                                    <div className="text-center py-8 text-on-surface-variant">No active operations currently.</div>
                                                ) : (
                                                    requests.filter(r => ['team_suggested', 'approved', 'workers_assigned', 'in_progress', 'payment_pending'].includes(r.status)).slice(0, 2).map((req) => (
                                                        <div key={req.request_id} className="bg-surface-container-lowest border-l-[4px] border-l-primary border border-outline-variant rounded-r-lg p-4 cursor-pointer hover:bg-surface-container transition-colors" onClick={() => navigate(`/customer/track/${req.request_id}`)}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h3 className="text-on-surface text-body-lg font-semibold">{req.work_type.replace('_', ' ').toUpperCase()}</h3>
                                                                    <p className="text-on-surface-variant text-label-md">Site: {req.work_address}</p>
                                                                </div>
                                                                <span className="px-2 py-1 bg-primary-container/20 text-primary rounded text-[10px] uppercase font-bold">{req.status.replace('_', ' ')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-3 mb-3">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-on-surface-variant text-[16px]">group</span>
                                                                    <span className="text-on-surface text-label-md font-semibold">{req.estimated_workers} Workers</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-on-surface-variant text-[16px]">verified</span>
                                                                    <span className="text-on-surface text-label-md">{req.assigned_union_details?.union_name || 'Pending Team'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </section>

                                        {/* Recent History */}
                                        <section className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden shadow-sm">
                                            <div className="flex items-center justify-between p-4 border-b border-outline-variant">
                                                <h2 className="text-on-surface text-title-lg flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">history</span>
                                                    Recent History
                                                </h2>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-surface-container-low text-on-surface-variant text-label-md uppercase border-b border-outline-variant">
                                                            <th className="p-3 font-medium">Task / Site</th>
                                                            <th className="p-3 font-medium">Date</th>
                                                            <th className="p-3 font-medium">Labor</th>
                                                            <th className="p-3 font-medium">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-body-md text-on-surface">
                                                        {requests.filter(r => ['completed', 'cancelled'].includes(r.status)).length === 0 ? (
                                                            <tr>
                                                                <td colSpan="4" className="text-center py-6 text-on-surface-variant">No history found</td>
                                                            </tr>
                                                        ) : (
                                                            requests.filter(r => ['completed', 'cancelled'].includes(r.status)).slice(0, 4).map((req) => (
                                                                <tr key={req.request_id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                                                    <td className="p-3">
                                                                        <div className="font-medium">{req.work_type.replace('_', ' ').toUpperCase()}</div>
                                                                        <div className="text-label-sm text-on-surface-variant">{req.district}</div>
                                                                    </td>
                                                                    <td className="p-3">{new Date(req.created_at).toLocaleDateString()}</td>
                                                                    <td className="p-3">{req.estimated_workers} Workers</td>
                                                                    <td className="p-3">
                                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-label-sm font-semibold ${req.status === 'completed' ? 'bg-secondary-container/20 text-secondary' : 'bg-error-container/20 text-error'}`}>
                                                                            <span className="material-symbols-outlined text-[14px]">{req.status === 'completed' ? 'check_circle' : 'cancel'}</span> 
                                                                            {req.status === 'completed' ? 'Done' : 'Cancelled'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>

                                    </div>

                                    {/* Right Column */}
                                    <aside className="flex flex-col gap-6">
                                        {/* Notifications */}
                                        <section className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden shadow-sm flex flex-col h-full max-h-[600px]">
                                            <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-lowest sticky top-0">
                                                <h2 className="text-on-surface text-title-lg flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">notifications_active</span>
                                                    Alerts & Activity
                                                </h2>
                                                <span className="bg-error text-on-error text-label-sm px-2 py-1 rounded-full font-bold">New</span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-surface">
                                                <div className="flex gap-3 p-3 bg-primary-container/10 border border-primary-container/30 rounded-md">
                                                    <div className="mt-1 text-primary">
                                                        <span className="material-symbols-outlined text-[20px]">person_check</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-on-surface text-body-md font-medium">Welcome to LoadLink</p>
                                                        <p className="text-on-surface-variant text-label-md mt-1">Your dashboard is ready. Start by requesting workers.</p>
                                                        <span className="text-on-surface-variant text-label-sm mt-1 block">Just now</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Metric Tile */}
                                        <section className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 shadow-sm flex items-center justify-between">
                                            <div>
                                                <p className="text-on-surface-variant text-label-md uppercase font-bold tracking-wider mb-1">Total Active Laborers</p>
                                                <p className="text-on-surface text-display-lg leading-none">
                                                    {requests.filter(r => ['in_progress'].includes(r.status)).reduce((acc, curr) => acc + curr.estimated_workers, 0)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center text-secondary gap-1 bg-secondary-container/20 px-2 py-1 rounded">
                                                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                                    <span className="text-label-md font-bold">Active</span>
                                                </div>
                                            </div>
                                        </section>
                                    </aside>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
