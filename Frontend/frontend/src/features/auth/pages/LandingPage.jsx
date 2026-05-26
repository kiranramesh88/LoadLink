import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./LandingPage.css";

const LandingPage = () => {
    const navigate = useNavigate();
    const { token, user } = useSelector((state) => state.auth);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fading out after 7.5s (2.5s animation + 5s stability)
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 7500);

        // Redirect after 8.1s (giving 600ms for CSS fadeout transition)
        const redirectTimer = setTimeout(() => {
            if (!token) {
                navigate("/login", { replace: true });
            } else if (user?.role === "CUSTOMER") {
                navigate("/customer/dashboard", { replace: true });
            } else if (user?.role === "UNION_ADMIN") {
                navigate("/union/dashboard", { replace: true });
            } else {
                navigate("/worker", { replace: true });
            }
        }, 8100);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(redirectTimer);
        };
    }, [token, user, navigate]);

    return (
        <div className={`landing-container ${fadeOut ? "fade-out" : ""}`}>
            <div className="brand-reveal-wrapper">
                <div className="logo-icon-wrapper">
                    <svg viewBox="0 0 1366 1366" className="logo-svg">
                        {/* Left Cradling Arm */}
                        <path 
                            className="svg-left-arm" 
                            d="M397.04,383.79c-23.04,94.15-46.08,188.29-69.12,282.44c-1.61,17.78-2.7,59.38,23.04,98.13
                                c19.61,29.53,45.83,43.89,62.29,52.9c29.86,16.36,45,15.4,93.01,30.72c19.96,6.37,48.02,16.33,81.06,31.57
                                c22.95,17.9,59.06,52.5,63.14,98.98c1.61,18.4-1.67,40.04-4.27,57.17c-3.95,26.02-9.75,47.29-14.51,62.29
                                c-47.5-0.28-95-0.57-142.5-0.85c5.12-23.89,10.24-47.78,15.36-71.68c-0.03-5.32-0.71-13.37-4.27-22.19
                                c-2.68-6.66-9.87-20.85-36.69-36.69c-21.46-12.67-40.34-17.46-45.22-18.77c-52.14-13.99-90.38-56.13-99.84-66.56
                                c-45.98-50.67-48.01-119.49-46.93-149.33c24.75-101.83,49.49-203.65,74.24-305.48c3.37-6.56,10.07-17.49,22.19-27.31
                                C379.16,390.13,390.17,385.86,397.04,383.79z"
                        />
                        {/* Tilted Cargo Box */}
                        <path 
                            className="svg-box" 
                            d="M438,342.83c-27.02,110.36-54.04,220.72-81.06,331.08c-1.48,8.38-5.46,37,11.09,66.56
                                c13.6,24.28,33.62,35.91,41.81,40.11c81.63,26.17,163.26,52.34,244.9,78.5c5.4,1.52,48.15,12.78,84.48-14.51
                                c22.59-16.96,30.66-39.79,33.28-48.64c29.01-118.04,58.02-236.08,87.04-354.12c1.56-9.92,3.74-32.61-6.83-58.02
                                c-13.21-31.77-37.82-47.31-46.08-52.05c-86.47-23.89-172.94-47.78-259.4-71.68c-7.79-1.11-37.6-4.44-66.56,14.51
                                C444.83,298,438.82,336.85,438,342.83z"
                        />
                        {/* Right Cradling Arm */}
                        <path 
                            className="svg-right-arm" 
                            d="M880.01,485.33c-20.19,79.36-40.39,158.71-60.58,238.07c-5.45,22.15-10.73,60.72,7.68,97.28
                                c10.12,20.08,22.8,35.73,40.96,49.49c18.77,14.22,37.55,28.44,56.32,42.66c6.41,5.64,15.24,15.15,19.63,29.01
                                c6.18,19.53,0.16,37.05-3.41,47.78c-9.55,28.68-19.59,62.8-31.57,106.66c44.94,0.28,89.88,0.57,134.82,0.85
                                c14.51-43.52,29.01-87.04,43.52-130.55c3-9.76,12.19-43.92-3.41-82.77c-14.88-37.05-43.01-55.24-52.05-60.58
                                c-27.87-18.2-55.75-36.41-83.62-54.61c-9.87-9.12-26.31-26.7-37.55-53.76c-10.13-24.41-11.71-46.14-11.66-59.16
                                c-1.21-13.78-1.72-29.89-0.57-47.78c1.06-16.54,3.32-31.34,5.97-44.09c1.74-7.75,5.27-28.37-4.55-50.91
                                C894.03,499.4,885.61,490.4,880.01,485.33z"
                        />
                        {/* Bottom Connection Circle */}
                        <ellipse 
                            className="svg-circle" 
                            cx="790.13" 
                            cy="993.19" 
                            rx="105.11" 
                            ry="95.72"
                            transform="matrix(0.233 -0.9725 0.9725 0.233 -359.7955 1530.2201)"
                        />
                    </svg>
                </div>
                <div className="brand-text-wrapper">
                    <span className="brand-text">LoadLink</span>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
