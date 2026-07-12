import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const Avatar = () => {
    const [searchParams] = useSearchParams();
    const signup_token = searchParams.get("signup_token");
    const [imageUrl, setImageUrl] = useState<string>("");
    const [loadingAvatars, setLoadingAvatars] = useState<boolean>(true);
    const [avatars, setAvatars] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [creating, setCreating] = useState<boolean>(false)
    const [name, setName] = useState<string>()
    const navigate = useNavigate();

    async function fetchAvatars() {
        try {
            if (!signup_token) { setError("No token found."); return; }
            localStorage.setItem("token", signup_token);
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/avatar`,
                { headers: { authorization: `Bearer ${signup_token}` } }
            );
            setAvatars(res.data.avatars.map((item: any) => ({ id: item.id, imageUrl: item.imageUrl })));
        } catch {
            setError("Failed to load avatars.");
        } finally {
            setLoadingAvatars(false);
        }
    }

    useEffect(() => { fetchAvatars(); }, []);

    async function submitAvatar() {
        try {
            setSubmitting(true);
            setError("");
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/add-avatar`,
                { avatarId: selectedId },
                { headers: { authorization: `Bearer ${signup_token}` } }
            );
            if (res.status === 200) {
                navigate(`/dashboard/?token=${signup_token}`);
            }
        } catch {
            setError("Failed to save avatar.");
        } finally {
            setSubmitting(false);
        }
    }

    async function crateAvatar(){
        try{
            setCreating(true)
            setError("");
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/avatar`,
                { imageUrl: imageUrl, name: name },
                { headers: { authorization: `Bearer ${signup_token}` } }
            )
            if(res.status === 200){
                fetchAvatars()
            }
            setCreating(false)
        }catch(error){
            setError("Failed to load Avatar")
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* Top bar */}
            <div className="px-10 py-5 border-b border-gray-100">
                <span className="text-sm font-semibold tracking-widest uppercase text-gray-800">MetaVerse</span>
            </div>

            <div className="max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Choose your avatar</h1>
                    <p className="text-sm text-gray-400 mt-1">This is how others will see you in the metaverse.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                {/* Avatar Grid */}
                {loadingAvatars ? (
                    <div className="grid grid-cols-6 gap-3">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : avatars.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-lg py-10 text-center">
                        <p className="text-sm text-gray-400">No avatars available. Use a custom URL below.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-6 md:grid-cols-8 gap-3">
                        {avatars.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setSelectedId(item.id); setImageUrl(item.imageUrl); }}
                                className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                                    selectedId === item.id
                                        ? "border-gray-900 shadow-md"
                                        : "border-transparent hover:border-gray-300"
                                }`}
                            >
                                <img
                                    src={item.imageUrl}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Custom Avatar */}
                <div className="border border-gray-100 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Or use a custom avatar URL</h2>
                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Image URL (https://...)"
                            className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                            onChange={(e) => { setImageUrl(e.target.value); setSelectedId(null); }}
                        />
                        <input
                            type="text"
                            placeholder="Name"
                            className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                            onChange = {(e) => {setName(e.target.value)}}
                        />
                        <button
                        onClick={crateAvatar}
                        disabled={creating || !imageUrl || !name}
                        className="bg-gray-900 text-white rounded-md px-6 py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {creating ? "Creating..." : "CreateAvatar"}
                    </button>
                    </div>
                    
                </div>

                <div className="flex items-center justify-between">
                    {imageUrl ? (
                        <div className="flex items-center gap-3">
                            <img src={imageUrl} alt="preview" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                            <p className="text-sm text-gray-500">Avatar preview</p>
                        </div>
                    ) : (
                        <div />
                    )}
                    <button
                        onClick={submitAvatar}
                        disabled={submitting || !selectedId}
                        className="bg-gray-900 text-white rounded-md px-6 py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Saving..." : "Continue →"}
                    </button>
                </div>
            </div>
        </div>
    );
};