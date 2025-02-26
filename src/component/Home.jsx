import { useState } from "react";
import BackImg from '../assets/bg1.jpg';
import Logo from '../assets/logo.jpg';

const AttendanceForm = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        churchCenter: "",
    });

    const [status, setStatus] = useState("");

    const [isWithinLocation, setIsWithinLocation] = useState(null);
    
    const googleScriptURL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
        // const googleScriptURL = "https://script.google.com/macros/s/AKfycbwkvayaxqKjWGFe1bMz4QBhTBpEkle7y1-BQ9PWqvKnpHEMIAwVnVFNAy_85Mwx2Oe3FA/exec";

    //Peter's House location
    const rehearsalVenue = {
        latitude: 7.844971, 
        longitude: 3.942641,
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
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;

                    
                    const distance = getDistance(userLat, userLon, rehearsalVenue.latitude, rehearsalVenue.longitude);

                    console.log("Distance to venue:", distance, "meters");

                    if (distance <= 1000) {
                        setIsWithinLocation(true);
                    } else {
                        setIsWithinLocation(false);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsWithinLocation(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
            setIsWithinLocation(false);
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

        const currentDate = new Date().toLocaleDateString("en-GB");

        // Add the date and location status to the form data
        const formDataWithDate = {
            ...formData,
            date: currentDate,
            isWithinLocation: isWithinLocation ? "Yes" : "No"
        };

        // Convert form data to URLSearchParams
        const formDataUrl = new URLSearchParams();
        Object.keys(formDataWithDate).forEach((key) => {
            formDataUrl.append(key, formDataWithDate[key]);
        });

        try {
            const response = await fetch(googleScriptURL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formDataUrl.toString(),
            });

            const result = await response.text();
            if (result === "success") {
                setStatus("Submitted successfully!");
                setFormData({ fullName: "", churchCenter: "" });
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            console.error("Error submitting:", error);
            alert("Submission failed. Please try again.");
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

                    {/* Location Verification Button */}
                    <button
                        onClick={checkLocation}
                        className="bg-[#1c69a0] text-white px-4 py-2 rounded-md w-full mb-4"
                    >
                        Verify Location
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
                            className={`px-4 py-2 mt-10 rounded-md w-full ${isWithinLocation === true ? "bg-[#1c69a0]  text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                }`}
                            disabled={isWithinLocation !== true}
                        >
                            Submit Attendance
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AttendanceForm;
