import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardData, updateAvailabilityStatus } from '../slice/workerSlice';
import { getTranslation } from '../../../utils/translations';

const WorkerDashboard = () => {
  const dispatch = useDispatch();
  const { isOnline, wallet, activeWork, profile, loading } = useSelector((state) => state.worker);
  const { user } = useSelector((state) => state.auth);

  const lang = user?.language || 'en';
  const t = (key) => getTranslation(lang, `dashboard.${key}`);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleToggleStatus = (status) => {
    dispatch(updateAvailabilityStatus(status));
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {/* TopAppBar */}
      <header className="bg-surface dark:bg-on-background border-b border-outline-variant fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 md:hidden transition-all">
        <button aria-label="Menu" className="text-primary dark:text-primary-fixed hover:bg-surface-container-high dark:hover:bg-inverse-surface p-sm rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>menu</span>
        </button>
        <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Workforce Kerala</h1>
        <div className="h-10 w-10 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center text-on-surface-variant font-bold">
          {user?.full_name?.charAt(0) || user?.first_name?.charAt(0) || 'W'}
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-[80px] pb-[100px] px-md max-w-container-max mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-lg md:px-xl">
        <div className="md:col-span-8 md:col-start-3 lg:col-span-8 lg:col-start-3 flex flex-col gap-lg">
          
          {/* Availability Toggle Section */}
          <section className="bg-surface-container-low rounded-xl p-md flex flex-col items-center justify-center gap-sm">
            <h2 className="font-body-md text-body-md text-on-surface-variant text-center mb-xs">
              {t('status')} {lang === 'en' ? '/ സ്റ്റാറ്റസ്' : ''}
            </h2>
            <div className="bg-surface rounded-full p-xs flex w-full max-w-[448px] border border-outline-variant relative">
              {loading && <div className="absolute inset-0 bg-white/50 rounded-full z-10 flex items-center justify-center"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
              <button 
                onClick={!isOnline ? () => handleToggleStatus('available') : undefined}
                disabled={loading}
                className={`flex-1 py-sm rounded-full font-title-lg text-title-lg text-center transition-colors ${
                  isOnline 
                    ? 'bg-primary text-on-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest cursor-pointer'
                }`}
              >
                {t('available')}
              </button>
              <button 
                onClick={isOnline ? () => handleToggleStatus('busy') : undefined}
                disabled={loading}
                className={`flex-1 py-sm rounded-full font-title-lg text-title-lg text-center transition-colors ${
                  !isOnline 
                    ? 'bg-primary text-on-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest cursor-pointer'
                }`}
              >
                {t('busy')}
              </button>
            </div>
          </section>

          {/* Earnings & Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            
            {/* Wallet Balance (Blue Element from Wallet Page) */}
            <section className="bg-primary text-on-primary rounded-xl shadow-[0_4px_12px_rgba(30,41,59,0.15)] p-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
              <div className="absolute right-12 top-12 w-16 h-16 bg-white opacity-5 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-primary-fixed">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                  <h3 className="font-title-lg text-title-lg">{t('walletBalance')}</h3>
                </div>
                <p className="font-body-md text-body-md text-primary-fixed mb-1">{t('availableAmount')}</p>
                <span className="font-headline-lg-mobile text-headline-lg-mobile block mb-1">₹{Number(wallet?.available_balance || 0).toFixed(2)}</span>
              </div>
            </section>

            {/* Completed Works */}
            <section className="bg-surface border border-outline-variant rounded-xl p-md shadow-[0_4px_12px_rgba(30,41,59,0.05)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-sm">
                  <p className="font-body-md text-body-md text-on-surface-variant">Completed Works {lang === 'ml' ? '' : ''}</p>
                  <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">{t('completedWorks')}</p>
              </div>
              <p className="font-display-lg text-display-lg text-on-surface">{profile?.total_completed_works || 0}</p>
            </section>
          </div>

          {/* Active Work Card */}
          {activeWork && (
            <section className="bg-surface border border-outline-variant border-l-4 rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(30,41,59,0.05)] border-l-primary">
              <div className="p-md border-b border-outline-variant flex justify-between items-start">
                <div>
                  <span className="inline-block px-sm py-xs bg-primary-fixed text-on-primary-fixed rounded-sm font-label-md text-label-md uppercase tracking-wider mb-sm">
                    {t('active')}
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
                    {activeWork.work_title || 'Active Task'}
                  </h3>
                  <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {activeWork.work_address || 'Current Location'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-label-md text-label-md text-on-surface-variant">{t('time')}</p>
                  <p className="font-title-lg text-title-lg text-on-surface">
                    {activeWork.scheduled_time ? new Date(`1970-01-01T${activeWork.scheduled_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </p>
                </div>
              </div>
              
              <div className="bg-surface-container-lowest p-md flex justify-between items-center">
                <div className="flex items-center gap-sm">
                  <div className="h-3 w-3 rounded-full bg-secondary"></div>
                  <span className="font-body-md text-body-md text-on-surface">{t('onSite')}</span>
                </div>
                <Link to={`/worker/work/${activeWork.work_request_id}`} className="px-md py-sm bg-primary text-on-primary rounded-lg font-title-lg text-title-lg hover:shadow-[0_4px_12px_rgba(30,41,59,0.05)] transition-all inline-block">
                  {t('updateStatus')}
                </Link>
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;
