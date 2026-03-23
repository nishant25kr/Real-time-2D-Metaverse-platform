import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const Avatar = () => {
    const [searchParams] = useSearchParams();
    const signup_token = searchParams.get("signup_token");

    const [name, setName] = useState<string>("default");
    const [imageUrl, setImageurl] = useState<string>("");
    const [loadingAvatar, setLoadingAvatar] = useState<boolean>(true);
    const [avatars, setAvatars] = useState<any[]>([]);
    const [error, setError] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    const navigate = useNavigate();

    async function fetchAvatars() {
        try {
            if (!signup_token) {
                setError("No token found");
                return;
            }

            localStorage.setItem("token", signup_token);

            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/avatar`,
                {
                    headers: {
                        authorization: `Bearer ${signup_token}`
                    }
                }
            );

            const formatted = res.data.avatars.map((item: any) => ({
                id: item.id,
                imageUrl: item.imageUrl
            }));

            setAvatars(formatted);
        } catch (err: any) {
            setError("Failed to load avatars");
        } finally {
            setLoadingAvatar(false);
        }
    }

    useEffect(() => {
        fetchAvatars();
    }, []);

    async function submitAvatar() {
        if (!imageUrl) {
            setError("Please select or enter an avatar");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/avatar`,
                {
                    imageUrl,
                    name
                },
                {
                    headers: {
                        authorization: `Bearer ${signup_token}`
                    }
                }
            );

            if (res.status === 200) {
                navigate(`/dashboard/?token=${signup_token}`);
            }
        } catch (err: any) {
            setError("Failed to submit avatar");
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingAvatar) {
        return (
            <div className="min-h-screen flex justify-center items-center text-white bg-black">
                Loading avatars...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <h2 className="text-2xl font-bold mb-4">Select Your Avatar</h2>

            {error && <p className="text-red-500 mb-3">{error}</p>}

            {/* Avatar list */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {avatars.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setImageurl(item.imageUrl)}
                        className={`p-2 border rounded-xl cursor-pointer ${
                            imageUrl === item.imageUrl
                                ? "border-blue-500"
                                : "border-gray-700"
                        }`}
                    >
                        <img
                            src={item.imageUrl}
                            alt="avatar"
                            className="w-full h-20 object-cover rounded"
                        />
                    </div>
                ))}
            </div>

            {/* Custom avatar */}
            <div className="space-y-3 max-w-sm">
                <input
                    type="text"
                    placeholder="Custom avatar URL"
                    className="w-full p-2 bg-gray-800 rounded"
                    onChange={(e) => setImageurl(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-2 bg-gray-800 rounded"
                    onChange={(e) => setName(e.target.value)}
                />

                <button
                    onClick={submitAvatar}
                    disabled={submitting}
                    className="w-full bg-blue-600 p-2 rounded hover:bg-blue-500"
                >
                    {submitting ? "Submitting..." : "Continue"}
                </button>
            </div>
        </div>
    );
};