import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const Avatar = () => {
    const [searchParams] = useSearchParams();
    const signup_token = searchParams.get("signup_token");
    const [name, setName] = useState<string>("defautl")
    const [imageUrl, setImageurl] = useState<string>()
    const [loadinAvatar, setLoadingAvatar] = useState<boolean>(true)
    const [avatars, setAvatars] = useState<any[]>([]);
    const navigate = useNavigate()
    
    
    async function fetchAvatars() {
        localStorage.setItem("token",signup_token!)
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/avatar`, {
            headers: {
                authorization: `Bearer ${signup_token}`
            }
        })
        const formatted = res.data.avatars.map((item: any) => ({
            id: item.id,
            imageUrl: item.imageUrl
        }));
        console.log(res.data.avatars)
        setAvatars(formatted)
        setLoadingAvatar(false)
    }
    
    useEffect(() => {
        fetchAvatars()
    }, [])

    async function submitAvatar() {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl,
            name
        }, {
            headers: {
                authorization: `Bearer ${signup_token}`
            }
        })
        if (res.status === 200) {
            navigate('/dashboard')
        }
    }

    if (loadinAvatar) {
        return <>loading</>
    }

    return (
        <div>
            <h5>select avatar</h5>
            {avatars.map((item) => (
                <li key={item.id}>
                    <img src={item.imageUrl} width="50" />
                    <button onClick={() => setImageurl(item.imageUrl)}>
                        Select
                    </button>
                </li>
            ))}
            <h1>give me avatar</h1>
            <div>
                <br />
                {signup_token} <br /> <br />
                avatar not there
                <input type="text" onChange={(e) => { setImageurl(e.target.value) }} />
                <input type="text" onChange={(e) => { setName(e.target.value) }} />
                <button onClick={() => { submitAvatar() }}>submit avatar</button>
            </div>
        </div>
    )
}