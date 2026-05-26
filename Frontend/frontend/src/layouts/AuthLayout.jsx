const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center px-4">
      {children}
    </div>
  );
};

export default AuthLayout;