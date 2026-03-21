import axios from "axios"
import { useState } from "react"
import { useNavigate} from "react-router-dom"

interface LoginProp {
    userId: string
}

export const Login = ({ userId }: LoginProp) => {
    const [username, setUsername] = useState<string>()
    const [password, setPassword] = useState<string>()
    const navigate = useNavigate()
    return (
        <div>
            {userId && `userId: ${userId}`}
            <h1>login</h1>
            <input type="text" onChange={(e) => { setUsername(e.target.value) }} />
            <input type="text" onChange={(e) => { setPassword(e.target.value) }} />
            <button onClick={async () => {
                const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/signin`, {
                    username,
                    password
                })

                const Avatar_res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/metadata/bulk?ids=["${userId}"]`, {
                    headers: {
                        authorization: `Bearer ${res.data.token}`
                    }
                })
                if (!Avatar_res.data.avatars[0].avatarId) {
                    navigate(`/avatar/?signup_token=${res.data.token}`)
                }else{
                    navigate("/dashboard")
                }
            }}>login</button>
        </div>
    )
}