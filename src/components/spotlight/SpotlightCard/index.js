"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from "lucide-react";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import Image from 'next/image';
import { fetchAllSubmission } from '../../../lib/submission';
import { v4 as uuidv4 } from 'uuid';

dayjs.extend(relativeTime);

const VideoGallery = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetchAllSubmission();
                setVideos(response);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        getData();
    }, []);

    if (loading) return <div className='text-center'>Loading...</div>;
    if (!videos.length) return <p>No videos found</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
            ))}
        </div>
    );
};

const VideoCard = ({ video }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isVoted, setIsVoted] = useState(false);
    const [voting, setVoting] = useState(false); // New loading state

    const getUserId = () => {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = uuidv4();
            localStorage.setItem('userId', userId);
        }
        return userId;
    };

    useEffect(() => {
        const votedVideos = JSON.parse(localStorage.getItem('votedVideos')) || [];
        setIsVoted(votedVideos.includes(video.id));
    }, [video.id]);

    const handleVoteToggle = async (videoId) => {
        if (voting) return; // Prevent multiple requests

        const userId = getUserId();
        setVoting(true); // Set loading to prevent further clicks

        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, submissionId: videoId })
            });
            const result = await response.json();

            if (response.ok) {
                setIsVoted(!isVoted);

                const votedVideos = JSON.parse(localStorage.getItem('votedVideos')) || [];
                if (isVoted) {
                    const updatedVotes = votedVideos.filter((id) => id !== videoId);
                    localStorage.setItem('votedVideos', JSON.stringify(updatedVotes));
                } else {
                    votedVideos.push(videoId);
                    localStorage.setItem('votedVideos', JSON.stringify(votedVideos));
                }
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error('Error toggling vote:', error);
        } finally {
            setVoting(false); // Reset loading state
        }
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    return (
        <div
            className="w-[25vw] bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <figure className="aspect-video relative">
                <video
                    src={video.publicId ? video.video : ''}
                    controls
                    className="w-full h-full object-cover cursor-pointer"
                />
            </figure>
            <div className="p-4">
                <div className="flex items-center mb-2">
                    <Image
                        src={video.profilepic}
                        alt={video.participantName}
                        width={40}
                        height={40}
                        className="rounded-full mr-2"
                    />
                    <span className="text-sm font-semibold">{video.participantName}</span>
                </div>
                <h2 className="text-lg font-bold truncate">{video.postTitle}</h2>
                <p className="text-sm text-gray-600 mb-4">{video.description}</p>
                <div className='flex items-center justify-between'>
                    <div className="text-sm text-gray-600">
                        Uploaded {dayjs(video.createdAt).fromNow()}
                    </div>
                    <div className="bg-opacity-70 relative rounded-lg text-sm flex items-center">
                        <Clock size={16} className="mr-1" />
                        {formatDuration(video.duration)}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <button
                        className={`w-full justify-center font-bold py-2 px-4 rounded inline-flex items-center ${isVoted ? 'bg-red-500 hover:bg-red-700' : 'bg-[#004873] hover:bg-[#0076ff]'
                            } text-white uppercase`}
                        onClick={() => handleVoteToggle(video.id)}
                        disabled={voting} // Disable button while voting
                    >
                        {isVoted ? "Unvote" : "Vote"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoGallery;
