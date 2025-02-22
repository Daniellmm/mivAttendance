import { useState } from "react";
import BackImg from '../assets/bg1.jpg'
import Logo from '../assets/logo.jpg'

const AttendanceForm = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        churchCenter: "",
    });

    const googleScriptURL = "YOUR_GOOGLE_SCRIPT_DEPLOYED_URL";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        const currentDate = new Date().toLocaleDateString("en-GB");

        const dataToSend = {
            ...formData,
            date: currentDate,
        };

        try {
            await fetch(googleScriptURL, {
                method: "POST",
                body: JSON.stringify(dataToSend),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            alert("Attendance Submitted!");
            setFormData({ fullName: "", churchCenter: "" });
        } catch (error) {
            console.error("Error submitting:", error);
        }
    };


    return (
        <section className="overflow-hidden">
            <div className="relative h-screen flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BackImg})` }}></div>
                <div className="absolute inset-0 bg-black opacity-80"></div>

                <div className=" relative z-10 max-w-md lg:mx-auto mx-5 p-4 bg-white shadow-md rounded-md">

                    <div className="flex justify-center items-center pb-10">
                        <img src={Logo} alt="" />
                    </div>
                    <h2 className="md:text-2xl text-center text-lg font-bold mb-4">General Rehearsal Attendance</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Enter Your Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="border p-2 w-full mb-8 mt-5"
                            required
                        />
                        <select
                            name="churchCenter"
                            value={formData.churchCenter}
                            onChange={handleChange}
                            className="border p-2 w-full mb-3"
                            required
                        >
                            <option value="">Select Your Center</option>
                            <option value="Center A">My Father's House</option>
                            <option value="Center B">Harvester</option>
                            <option value="Center C">Grace House</option>
                            <option value="Center C">Potter House</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-[#1c69a0] text-white px-4 py-2 rounded-md w-full"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AttendanceForm;
