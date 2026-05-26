import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitWorkRequest } from '../../slice/customerSlice';
import toast from 'react-hot-toast';

const LocationQuotation = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { draftBooking, actionLoading } = useSelector((state) => state.customer);
    
    const [location, setLocation] = useState({
        address: draftBooking.location.address || '',
        district: draftBooking.location.district || '',
        latitude: draftBooking.location.latitude || 10.02, 
        longitude: draftBooking.location.longitude || 76.30
    });

    const [dateTime, setDateTime] = useState({
        date: draftBooking.dateTime.date || new Date().toISOString().split('T')[0],
        time: draftBooking.dateTime.time || '10:00'
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search for Nominatim
    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 2) {
                searchLocation(searchQuery);
            } else {
                setSuggestions([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const searchLocation = async (query) => {
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Kerala, India')}&limit=5`);
            const data = await res.json();
            setSuggestions(data);
        } catch (error) {
            console.error("Geocoding error", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        setLocation(prev => ({
            ...prev,
            address: suggestion.display_name,
            latitude: parseFloat(suggestion.lat),
            longitude: parseFloat(suggestion.lon)
        }));
        setSearchQuery('');
        setSuggestions([]);
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }
        
        toast.loading("Fetching your location...", { id: "geo" });
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    
                    // Try to extract district from address
                    let district = location.district;
                    if (data.address) {
                        const potentialDistrict = data.address.state_district || data.address.county || data.address.city;
                        if (potentialDistrict) {
                            // Extract just the name if it has "District" in it
                            district = potentialDistrict.replace(/ district/i, '').trim();
                        }
                    }

                    setLocation(prev => ({
                        ...prev,
                        address: data.display_name || '',
                        latitude: latitude,
                        longitude: longitude,
                        district: district
                    }));
                    toast.success("Location updated", { id: "geo" });
                } catch (error) {
                    toast.error("Failed to fetch address details", { id: "geo" });
                }
            },
            (error) => {
                toast.error("Unable to retrieve your location", { id: "geo" });
            }
        );
    };

    // Mirror the backend estimation logic based on total numerical inputs
    const calculateEstimate = () => {
        let totalQuantity = 0;
        const answers = draftBooking.answers || {};
        
        for (const key in answers) {
            const val = answers[key];
            if (val === 'true' || val === 'false' || typeof val === 'boolean') continue;
            const num = Number(val);
            if (!isNaN(num) && val !== '') {
                totalQuantity += num;
            }
        }

        if (totalQuantity >= 500) return { workers: 8, price: 5000 };
        if (totalQuantity >= 200) return { workers: 5, price: 3000 };
        if (totalQuantity >= 100) return { workers: 3, price: 1500 };
        return { workers: 2, price: 700 };
    };

    const estimate = calculateEstimate();

    const handleSubmit = async () => {
        if (!location.address || !location.district) {
            toast.error("Please provide complete address and district");
            return;
        }

        // Pre-flight: check if token exists before making the API call
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Your session has expired. Please log in again.");
            // Redirect to login
            window.location.href = '/login';
            return;
        }

        const formattedAnswers = Object.entries(draftBooking.answers || {}).map(([key, value]) => ({
            question_id: key,
            answer: value
        }));

        const payload = {
            work_type: draftBooking.work_type,
            answers: formattedAnswers,
            work_address: location.address,
            district: location.district,
            latitude: location.latitude,
            longitude: location.longitude,
            scheduled_date: dateTime.date,
            scheduled_time: dateTime.time,
        };

        const resultAction = await dispatch(submitWorkRequest(payload));
        if (submitWorkRequest.fulfilled.match(resultAction)) {
            toast.success("Work request submitted successfully!");
            navigate('/customer/dashboard');
        } else {
            // resultAction.payload now has a proper message (detail, message, or status)
            const errorMsg = resultAction.payload || "Failed to submit request. Please try again.";
            toast.error(String(errorMsg));
        }
    };

    return (
        <div className="flex flex-col animate-fadeIn">
            {/* Progress Tracker Step 3 */}
            <div className="flex flex-col gap-3 mb-10 max-w-2xl">
                <div className="flex justify-between items-end">
                    <p className="text-on-background text-label-md uppercase tracking-widest text-primary">Step 3 of 3</p>
                    <p className="text-on-surface-variant text-label-sm">Location & Scheduling</p>
                </div>
                <div className="rounded-full bg-surface-variant h-2 w-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: '100%' }}></div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Location & DateTime */}
                <div className="flex-1 flex flex-col gap-8">
                    
                    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-6">
                        <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                            <h2 className="text-title-lg text-on-background">Work Location</h2>
                            <button 
                                onClick={handleCurrentLocation}
                                className="flex items-center gap-1 text-primary hover:bg-primary-container/20 px-3 py-1.5 rounded-md transition-colors text-label-md font-bold"
                            >
                                <span className="material-symbols-outlined text-[18px]">my_location</span>
                                Use Current Location
                            </button>
                        </div>
                        
                        {/* Interactive OSM Map */}
                        <div className="w-full h-[250px] bg-surface-container rounded-lg border border-outline-variant relative overflow-hidden">
                            {(!isNaN(location.latitude) && !isNaN(location.longitude) && location.latitude !== null && location.longitude !== null) ? (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    marginHeight="0" 
                                    marginWidth="0" 
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(location.longitude)-0.005},${Number(location.latitude)-0.005},${Number(location.longitude)+0.005},${Number(location.latitude)+0.005}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface-variant text-on-surface-variant">
                                    <span className="material-symbols-outlined mr-2">location_off</span>
                                    Location unavailable
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 relative">
                            <div className="relative">
                                <label className="text-label-md font-semibold text-on-surface-variant mb-1 block">Search Location</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        className="w-full p-3 pl-10 bg-surface-container-lowest border border-outline-variant rounded-md text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="Search for an area or landmark..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant">search</span>
                                    {isSearching && <span className="absolute right-3 top-3 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>}
                                </div>
                                
                                {/* Autocomplete Suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg overflow-hidden">
                                        {suggestions.map((sug, i) => (
                                            <div 
                                                key={i} 
                                                className="p-3 hover:bg-surface-container cursor-pointer text-body-sm text-on-surface border-b border-outline-variant/50 last:border-0 flex items-start gap-2"
                                                onClick={() => handleSelectSuggestion(sug)}
                                            >
                                                <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">location_on</span>
                                                <span>{sug.display_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-label-md font-semibold text-on-surface-variant mb-1 block">Full Address</label>
                                <textarea 
                                    className="w-full p-3 bg-surface-container border border-outline-variant rounded-md text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-24"
                                    placeholder="Enter complete address..."
                                    value={location.address}
                                    onChange={(e) => setLocation({...location, address: e.target.value})}
                                ></textarea>
                            </div>
                            <div>
                                <label className="text-label-md font-semibold text-on-surface-variant mb-1 block">District</label>
                                <select 
                                    className="w-full p-3 bg-surface-container border border-outline-variant rounded-md text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    value={location.district}
                                    onChange={(e) => setLocation({...location, district: e.target.value})}
                                >
                                    <option value="">Select District</option>
                                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                                    <option value="Kollam">Kollam</option>
                                    <option value="Pathanamthitta">Pathanamthitta</option>
                                    <option value="Ernakulam">Ernakulam</option>
                                    <option value="Thrissur">Thrissur</option>
                                    <option value="Kozhikode">Kozhikode</option>
                                    {/* Add other districts */}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-6">
                        <h2 className="text-title-lg text-on-background border-b border-outline-variant pb-3">Scheduling</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-label-md font-semibold text-on-surface-variant mb-1 block">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full p-3 bg-surface-container border border-outline-variant rounded-md text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    value={dateTime.date}
                                    onChange={(e) => setDateTime({...dateTime, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-label-md font-semibold text-on-surface-variant mb-1 block">Time</label>
                                <input 
                                    type="time" 
                                    className="w-full p-3 bg-surface-container border border-outline-variant rounded-md text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    value={dateTime.time}
                                    onChange={(e) => setDateTime({...dateTime, time: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Quotation */}
                <div className="w-full lg:w-[350px] shrink-0">
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm sticky top-24 overflow-hidden">
                        <div className="bg-primary-container/30 p-4 border-b border-outline-variant">
                            <h3 className="text-title-lg text-on-background flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                Estimated Quotation
                            </h3>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Provisional Estimate</p>
                            
                            <div className="flex justify-between items-center py-2 border-b border-outline-variant border-dashed">
                                <span className="text-on-surface-variant">Workers Required</span>
                                <span className="font-semibold text-on-background">{estimate.workers} Workers</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-outline-variant border-dashed">
                                <span className="text-on-surface-variant">Base Rate</span>
                                <span className="font-semibold text-on-background">₹{estimate.price}</span>
                            </div>
                            
                            <div className="bg-surface-container p-3 rounded mt-2 flex flex-col items-center justify-center gap-1">
                                <span className="text-label-sm text-on-surface-variant">Final pricing generated upon submission</span>
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={actionLoading}
                                className={`mt-4 w-full py-3 rounded-lg text-on-primary font-bold shadow-md transition-all flex justify-center items-center gap-2 ${actionLoading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-fixed-variant'}`}
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>Submit Request <span className="material-symbols-outlined text-[20px]">send</span></>
                                )}
                            </button>
                            <button 
                                onClick={() => navigate(-1)}
                                className="w-full py-2 text-on-surface-variant hover:text-on-background transition-colors text-label-md"
                            >
                                Back to Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationQuotation;
