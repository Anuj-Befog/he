"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UploadForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [profilePicFile, setProfilePicFile] = useState(null);

    // Participant data
    const [formData, setFormData] = useState({
        participantId: '',
        participantName: '',
        participantEmail: '',
        participantAge: '',
        participantAgeCriteria: '',
        participanTalent: '',
        postTitle: '',
        description: '',
        originalSize: '',
        partcipantAddress: '',
        participantNumber: '',
        participantCharge: '',
        participantPaymentID: '',
        participantPaymentStatus: ''
    });

    // Fetch data based on email
    useEffect(() => {
        const fetchData = async () => {
            if (!email) return;

            setLoading(true);
            setError('');

            try {
                // Check if the user already has an existing submission
                const checkResponse = await axios.get(`/api/checksubmission?email=${encodeURIComponent(email)}`);
                console.log("Submission check response:", checkResponse.data);

                if (checkResponse.data.success) {
                    setError("You have already uploaded a video. Multiple uploads are not allowed.");
                    setTimeout(() => {
                        alert("You have already uploaded a video. Multiple uploads are not allowed.");
                    }, 1000);
                    setEmail(''); // Clear email field
                    return; // Stop further execution if the user has already uploaded
                }

                // Fetch payment data by email if no submission exists
                const response = await axios.get(`/api/payment/getDataByEmail?email=${encodeURIComponent(email)}`);
                console.log('Payment data:', response.data);

                if (response.data.success && response.data.data.length > 0) {
                    const participantData = response.data.data[0];
                    const {
                        participantName,
                        participantAge,
                        ageCriteria: participantAgeCriteria,
                        talent: participanTalent,
                        guardianNumber: participantNumber,
                        address: partcipantAddress,
                        charge: participantCharge,
                        paymentId: participantPaymentID,
                        status: participantPaymentStatus
                    } = participantData;

                    setFormData(prev => ({
                        ...prev,
                        participantId: email.split('@')[0], // Generate participantId from email
                        participantName,
                        participantEmail: email,
                        participantAge,
                        participantAgeCriteria,
                        participanTalent,
                        participantNumber,
                        partcipantAddress,
                        participantCharge,
                        participantPaymentID,
                        participantPaymentStatus,
                    }));
                } else {
                    setError('No user found for this email.');
                }
            } catch (error) {
                console.error('Error fetching data:', error.response?.data || error.message);
                setError('Error fetching data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        const handler = setTimeout(() => {
            fetchData();
        }, 500); // Debounce for 500 ms

        return () => {
            clearTimeout(handler);
        };
    }, [email]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'file') {
            setVideoFile(files[0]);
        } else if (name === 'profilepic') {
            setProfilePicFile(files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        // Append form data
        for (const key in formData) {
            data.append(key, formData[key]);
        }

        // Append files
        data.append('file', videoFile);
        data.append('profilepic', profilePicFile);

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3000/api/submission', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Upload success:', response.data);

            // Reset form after successful upload
            setFormData({
                participantId: '',
                participantName: '',
                participantEmail: '',
                participantAge: '',
                participantAgeCriteria: '',
                participanTalent: '',
                postTitle: '',
                description: '',
                originalSize: '',
                partcipantAddress: '',
                participantNumber: '',
                participantCharge: '',
                participantPaymentID: '',
                participantPaymentStatus: ''
            });
            setVideoFile(null);
            setProfilePicFile(null);
        } catch (error) {
            console.error('Upload failed:', error.response?.data || error.message);
            setError('Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] py-10 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Upload Form</h1>
            {loading && <p className="text-blue-600">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="w-[25vw] bg-white p-6 rounded shadow-md" encType="multipart/form-data">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Email:
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Title:
                    </label>
                    <input
                        type="text"
                        name="postTitle"
                        value={formData.postTitle}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Description:
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Profile Picture:
                    </label>
                    <input
                        type="file"
                        name="profilepic"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Video File:
                    </label>
                    <input
                        type="file"
                        name="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        required
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
                    disabled={loading} // Disable button while loading
                >
                    Upload
                </button>
            </form>
        </div>
    );
};

export default UploadForm;
