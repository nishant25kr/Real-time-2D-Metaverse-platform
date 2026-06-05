import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export const Dashboard = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [spaces, setSpaces] = useState<any[]>([])
    const [name, setName] = useState<string>("")
    const [width, setWidth] = useState<string>("")
    const [height, setHeight] = useState<string>("")
    const [mapId, setMapId] = useState<string>("")
    const [creating, setCreating] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [formError, setFormError] = useState<string>("")
    const navigate = useNavigate()

    useEffect(() => {
        fetchSpace()
    }, [])

    async function fetchSpace() {
        try {
            setLoading(true)
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/space/all`,
                { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
            )
            const data = res.data.spaces.slice(0, 10).map((s: any) => ({
                id: s.id,
                name: s.name,
                dimension: s.dimensions
            }))
            setSpaces(data)
        } catch {
            setError("Failed to load your spaces.")
        } finally {
            setLoading(false)
        }
    }

    async function HandleSubmit() {
        if (!name || !width || !height || !mapId) {
            setFormError("All fields are required.")
            return
        }
        try {
            setCreating(true)
            setFormError("")
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/space`,
                { name, width, height, mapId },
                { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
            )
            setName(""); setWidth(""); setHeight(""); setMapId("")
            fetchSpace()
        } catch {
            setFormError("Failed to create space.")
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">

            <div className="px-10 py-5 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold tracking-widest uppercase text-gray-800">MetaVerse</span>
                <button
                    onClick={() => { localStorage.clear(); navigate("/") }}
                    className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                    Log out
                </button>
            </div>

            <div className="max-w-4xl mx-auto w-full px-6 py-10 flex flex-col gap-10">

                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">Your Spaces</h2>
                        <span className="text-xs text-gray-400">{spaces.length} / 10</span>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : spaces.length === 0 ? (
                        <div className="border border-dashed border-gray-200 rounded-lg py-12 text-center">
                            <p className="text-gray-400 text-sm">No spaces yet. Create one below.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {spaces.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/space/?spaceId=${item.id}&token=${localStorage.getItem("token")}`)}
                                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all group"
                                >
                                    <p className="font-medium text-gray-900 text-sm group-hover:text-gray-700">{item.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{item.dimension ?? "Dimensions not set"}</p>
                                </div>
                            ))} 
                        </div>
                    )}
                </div>

                <div className="border border-gray-100 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-5">Create a new space</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Space name"
                            className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Map ID"
                            className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                            value={mapId}
                            onChange={(e) => setMapId(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Width (e.g. 100)"
                            className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Height (e.g. 100)"
                            className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                        />
                    </div>

                    {formError && (
                        <p className="text-red-500 text-sm mt-3">{formError}</p>
                    )}

                    <button
                        onClick={HandleSubmit}
                        disabled={creating}
                        className="mt-4 bg-gray-900 text-white rounded-md px-5 py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {creating ? "Creating..." : "Create space"}
                    </button>
                </div>
            </div>
        </div>
    )
}