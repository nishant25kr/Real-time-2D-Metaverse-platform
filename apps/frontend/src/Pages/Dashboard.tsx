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
    const [selectedId, setSelectedId] = useState<string>("")
    const [error, setError] = useState<string>("")
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || '';
    const navigate = useNavigate()

    useEffect(() => {
        fetchSpace()
    }, [])

    async function fetchSpace() {
        try {
            setLoading(true)

            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/space/all`,
                {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )

            const data = res.data.spaces
                .slice(0, 10)
                .map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    dimension: s.dimensions
                }))

            setSpaces(data)

        } catch (err) {
            setError("Failed to fetch spaces")
        } finally {
            setLoading(false)
        }
    }

    async function HandleSubmit() {
        if (!name || !width || !height || !mapId) {
            setError("All fields are required")
            return
        }

        try {
            setError("")

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/space`,
                {
                    name,
                    width,
                    height,
                    mapId
                },
                {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )

            console.log(res.data)

            fetchSpace()

            setName("")
            setWidth("")
            setHeight("")
            setMapId("")

        } catch (err) {
            setError("Failed to create space")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-black text-white">
                Loading spaces...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">

            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {error && (
                <p className="text-red-500 mb-4">{error}</p>
            )}

            {/* Spaces List */}
            <h2 className="text-xl mb-3">Your Spaces (Top 10)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {spaces.map((item) => (
                    <div
                        key={item.id}

                        onClick={() => {
                            setSelectedId(item.id)
                            navigate(`/space/?spaceId=${item.id}&token=${token}`)
                        }}
                        className={`p-4 border rounded-xl cursor-pointer ${selectedId === item.id
                                ? "border-blue-500"
                                : "border-gray-700"
                            }`}
                    >
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-gray-400 text-sm">
                            {item.dimension}
                        </p>
                    </div>
                ))}
            </div>

            {/* Create Space */}
            <h2 className="text-xl mb-3">Create New Space</h2>
            <div className="grid gap-3 max-w-md">

                <input
                    type="text"
                    placeholder="Space Name"
                    className="p-2 rounded bg-gray-800"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Width"
                    className="p-2 rounded bg-gray-800"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Height"
                    className="p-2 rounded bg-gray-800"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Map ID"
                    className="p-2 rounded bg-gray-800"
                    value={mapId}
                    onChange={(e) => setMapId(e.target.value)}
                />

                <button
                    onClick={HandleSubmit}
                    className="bg-blue-600 p-2 rounded hover:bg-blue-500"
                >
                    Create Space
                </button>

            </div>
        </div>
    )
}