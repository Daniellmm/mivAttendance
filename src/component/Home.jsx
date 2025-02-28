import { useState, useEffect } from "react";
import BackImg from '../assets/bg1.jpg';
import Logo from '../assets/logo.jpg';

const AttendanceForm = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        churchCenter: "",
    });

    const [status, setStatus] = useState("");
    const [isWithinLocation, setIsWithinLocation] = useState(null);
    const [submissionCount, setSubmissionCount] = useState(0);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

    const googleScriptURL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    

    // Function to fetch the submission count for the day
    const fetchSubmissionCount = async () => {
        try {
            const response = await fetch(`${googleScriptURL}?action=getCount`); // Call the doGet function
            const result = await response.json();
            setSubmissionCount(result.total); // Update the count
        } catch (error) {
            console.error("Error fetching submission count:", error);
        }
    };

    // Fetch the count when the component mounts
    useEffect(() => {
        fetchSubmissionCount(); // Fetch the count immediately when the component mounts

        // Set interval to update every 10 seconds
        const interval = setInterval(fetchSubmissionCount, 10000); // 10,000 ms = 10 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);



    //Peter's House location
    const rehearsalVenue = {
        latitude: 7.453568,
        longitude: 3.899401,
    };


    // //Relixcore location
    // const rehearsalVenue = {
    //     latitude: 7.843822, 
    //     longitude: 3.927699,
    // };


    // Church's Location
    // const rehearsalVenue = {
    //     latitude: 7.462489762472925, 
    //     longitude: 3.9130698895319016,
    // };


    const getDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Earth's radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // Convert to meters
    };


    const checkLocation = () => {
        setIsLoadingLocation(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;


                    const distance = getDistance(userLat, userLon, rehearsalVenue.latitude, rehearsalVenue.longitude);

                    console.log("Distance to venue:", distance, "meters");

                    if (distance <= 500) {
                        setIsWithinLocation(true);
                    } else {
                        setIsWithinLocation(false);
                    }
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsWithinLocation(false);
                    setIsLoadingLocation(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
            setIsWithinLocation(false);
            setIsLoadingLocation(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isWithinLocation) {
            alert("You are not at the rehearsal venue! Attendance not recorded.");
            return;
        }

        setIsLoadingSubmit(true);

        const currentDate = new Date().toLocaleDateString("en-GB");


        const formDataWithDate = {   // Add the date and location status to the form data
            ...formData,
            date: currentDate,
            isWithinLocation: isWithinLocation ? "Yes" : "No"
        };


        const formDataUrl = new URLSearchParams();  // Convert form data to URLSearchParams
        Object.keys(formDataWithDate).forEach((key) => {
            formDataUrl.append(key, formDataWithDate[key]);
        });

        try {
            const response = await fetch(googleScriptURL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formDataUrl.toString(),
            });

            const result = await response.json();
            if (result.status === "success") {
                setStatus("Submitted successfully!");
                alert("Submitted successfully!");
                setFormData({ fullName: "", churchCenter: "" });
                fetchSubmissionCount();
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            setStatus('Error Submitting Form.');
            console.error("Error submitting:", error);
            alert("Submission failed. Please try again.");
        } finally {
            setIsLoadingSubmit(false); // Stop loading
        }
    };

    return (
        <section className="overflow-hidden">
            <div className="relative h-screen flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BackImg})` }}></div>
                <div className="absolute inset-0 bg-black opacity-80"></div>

                <div className="relative z-10 max-w-md lg:mx-auto mx-5 p-4 bg-white shadow-md rounded-md">
                    <div className="flex justify-center items-center pb-10">
                        <img src={Logo} alt="Logo" />
                    </div>
                    <h2 className="md:text-2xl text-center text-lg font-bold mb-4">General Rehearsal Attendance</h2>

                    <div className="text-center mb-4">
                        <p className="text-lg font-semibold">Total attendee today: {submissionCount} </p>
                    </div>

                    {/* Location Verification Button */}
                    <button
                        onClick={checkLocation}
                        className="bg-[#1c69a0] text-white px-4 py-2 rounded-md w-full mb-4 flex items-center justify-center"
                        disabled={isLoadingLocation} // Disable button while loading
                    >
                        {isLoadingLocation ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            "Verify Location"
                        )}
                    </button>

                    {/* Show location status */}
                    {isWithinLocation === false && <p className="text-red-500 pb-10">❌ You are not at the venue!</p>}
                    {isWithinLocation === true && <p className="text-green-500 pb-10">✅ Location Verified! You can submit attendance.</p>}

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Enter Your Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="border p-2 w-full mb-4"
                            required
                        />
                        <select
                            name="churchCenter"
                            value={formData.churchCenter}
                            onChange={handleChange}
                            className="border p-2 w-full mb-4"
                            required
                        >
                            <option value="">Select Your Center</option>
                            <option value="My Father's House">My Father's House</option>
                            <option value="Harvester">Harvest House</option>
                            <option value="Grace House">Grace House</option>
                            <option value="Potter House">Potter's House</option>
                            <option value="Potter House">Convenant House</option>
                            <option value="Potter House">Word House</option>
                            <option value="Potter House">Revival House</option>
                            <option value="Potter House">Royal(Yoruba) House</option>
                            <option value="Potter House">Ikeja</option>
                            <option value="Potter House">Lekki</option>
                        </select>
                        <button
                            type="submit"
                            className={`px-4 py-2 mt-10 rounded-md w-full flex items-center justify-center ${isWithinLocation === true ? "bg-[#1c69a0]  text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                }`}
                            disabled={isWithinLocation !== true || isLoadingSubmit} 
                        >
                            {isLoadingSubmit ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                "Submit Attendance"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AttendanceForm;
