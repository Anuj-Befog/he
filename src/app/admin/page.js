'use client'; // Required when using useRouter in the App Router

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import from next/navigation
import { addAdminData, getAdminData } from '../services/index';

export default function AdminPage() {
    const [selectedTalent, setSelectedTalent] = useState('');
    const [selectedACharges, setSelectedACharges] = useState('');
    const [selectedBCharges, setSelectedBCharges] = useState('');
    const [dataId, setDataId] = useState(null); // Store fetched _id

    // Charges list based on talent
    // const chargesList = {
    //     Acting: [299, 399],
    //     Dancing: [299, 399],
    //     Mimicry: [299, 399],
    //     Singing: [299, 399],
    // };

    // Load data from getAdminData()
    useEffect(() => {
        const fetchData = async () => {
            const response = await getAdminData();
            if (response.success && response.data) {
                setDataId(response.data[0]._id); // Assuming the response contains data with _id
            } else {
                console.error('Error fetching data:', response.message);
            }
        };

        fetchData();
    }, []);

    const handleTalentChange = (e) => {
        const value = e.target.value;
        setSelectedTalent(value);
        setSelectedACharges(''); // Reset selected charges when talent changes
        setSelectedBCharges(''); // Reset selected charges when talent changes
    };

    const handleSubmit = async () => {
        if (!dataId) {
            console.log('Data ID not found. Cannot submit form.');
        }

        if (!selectedTalent || !selectedACharges || !selectedBCharges) {
            alert("Please fill in all fields.");
            return;
        }

        // Prepare form data to be sent to the server
        const formData = {
            _id: dataId,  // Pass the fetched _id
            selectedTalent,
            selectedACharges,
            selectedBCharges,
        };

        // Call the addAdminData function to post the data
        const response = await addAdminData(formData);

        // Check the response and navigate or display a message accordingly
        if (response.success) {
            alert("Form Saved");
            // Optionally, reset the form after successful submission
            setSelectedTalent('');
            setSelectedACharges('');
            setSelectedBCharges('');
        } else {
            // Handle the error accordingly (e.g., show an error message)
            alert(`Error: ${response.message}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Welcome to the Admin Panel</h1>
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                {/* Dropdown for Talent Categories */}
                <select
                    value={selectedTalent}
                    onChange={handleTalentChange}
                    className="border border-gray-300 rounded-lg p-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select a category</option>
                    <option value="Acting">Acting</option>
                    <option value="Dancing">Dancing</option>
                    <option value="Mimicry">Mimicry</option>
                    <option value="Singing">Singing</option>
                </select>

                {/* Dropdown for Group A Charges based on selected Talent */}
                {selectedTalent && (
                    <select
                        value={selectedACharges}
                        onChange={(e) => setSelectedACharges(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Group A Charges</option>
                        <option value={299}>₹ 299</option>
                    </select>
                )}

                {/* Dropdown for Group B Charges based on selected Talent */}
                {selectedTalent && (
                    <select
                        value={selectedBCharges}
                        onChange={(e) => setSelectedBCharges(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Group B Charges</option>
                        <option value={399}>₹ 399</option>
                    </select>
                )}

                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-blue-600 transition duration-200"
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
