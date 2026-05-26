import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import WorkerBottomNavbar from '../features/worker/components/WorkerBottomNavbar';
import AssignmentPopup from '../features/worker/components/AssignmentPopup';
import useWorkerSocket from '../hooks/useWorkerSocket';

const WorkerLayout = () => {
  // Connect WebSocket for real-time notifications
  useWorkerSocket();

  const incomingAssignment = useSelector((state) => state.worker.incomingAssignment);

  return (
    <div className="flex flex-col min-h-screen bg-surface-bright text-on-surface">
      {/* Main Content Area - padded for bottom nav */}
      <main className="flex-1 w-full pb-[80px] overflow-y-auto">
        <Outlet />
      </main>

      <WorkerBottomNavbar />

      {/* Real-time Assignment Popup */}
      {incomingAssignment && (
        <AssignmentPopup assignment={incomingAssignment} />
      )}
    </div>
  );
};

export default WorkerLayout;
