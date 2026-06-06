import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export const Dashboard = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [validatingSpaceId, setValidatingSpaceId] = useState<string | null>(null)
    const [passcodeMessages, setPasscodeMessages] = useState<Record<string, string>>({})
    const [spaces, setSpaces] = useState<any[]>([])
    const [name, setName] = useState<string>("")
    const [passcode, setPasscode] = useState<string>("")
    const [spacePasscodes, setSpacePasscodes] = useState<Record<string, string>>({})
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
        if (!name || !passcode) {
            setFormError("All fields are required.")
            return
        }
        try {
            setCreating(true)
            setFormError("")
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/space`,
                { name, passcode },
                { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
            )
            setName("");
            setPasscode("");
            fetchSpace()
        } catch {
            setFormError("Failed to create space.")
        } finally {
            setCreating(false)
        }
    }

    async function fetchSpaceWithId(spaceId: string) {
        const spacePasscode = spacePasscodes[spaceId] || ""
        if (!spacePasscode) {
            setPasscodeMessages(prev => ({
                ...prev,
                [spaceId]: "Passcode is required."
            }))
            return
        }

        setValidatingSpaceId(spaceId)
        setPasscodeMessages(prev => ({
            ...prev,
            [spaceId]: ""
        }))

        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/space/${spaceId}/${spacePasscode}`
            )

            if (res.status === 200) {
                navigate(`/space/?spaceId=${spaceId}&passcode=${spacePasscode}&token=${localStorage.getItem("token")}`)
            } else {
                setPasscodeMessages(prev => ({
                    ...prev,
                    [spaceId]: "Invalid passcode."
                }))
            }
        } catch {
            setPasscodeMessages(prev => ({
                ...prev,
                [spaceId]: "Invalid passcode."
            }))
        } finally {
            setValidatingSpaceId(null)
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
                            {spaces.map((item) => {
                                const isValidating = validatingSpaceId === item.id
                                const message = passcodeMessages[item.id] || ""

                                return (
                                    <div
                                        key={item.id}
                                        className="border border-gray-200 rounded-lg p-4 transition-all"
                                    >
                                        <p className="font-medium text-gray-900 text-sm mb-3">{item.name}</p>
                                        <input
                                            type="text"
                                            placeholder="Enter passcode"
                                            value={spacePasscodes[item.id] || ""}
                                            onChange={(e) => setSpacePasscodes(prev => ({
                                                ...prev,
                                                [item.id]: e.target.value
                                            }))}
                                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors mb-3"
                                        />
                                        <button
                                            onClick={() => fetchSpaceWithId(item.id)}
                                            disabled={isValidating}
                                            className="w-full bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isValidating ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                    Checking...
                                                </span>
                                            ) : (
                                                'Join'
                                            )}
                                        </button>
                                        {message && (
                                            <p className="mt-3 text-sm text-red-500">{message}</p>
                                        )}
                                    </div>
                                )
                            })}
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
                            placeholder="Passcode"
                            className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
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