import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

interface LoginProp {
    userId: string
}

export const Login = ({ userId }: LoginProp) => {

    const [username, setUsername] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [searchParams] = useSearchParams();
    const signup_token = searchParams.get("signup_token");
    const [avatar , setAvatar] = useState<boolean>(true)
    const [name, setName] = useState<string>()
    const [imageUrl, setImageurl] = useState<string>()

    const navigate = useNavigate()

    useEffect (()=>{
        if(!signup_token) return
        console.log(signup_token)
        tokenReceived() 
    },[signup_token])

    async function tokenReceived(){
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/metadata/bulk?ids=["${userId}"]`,{
            headers:{
                authorization:`Bearer ${signup_token}`
            }
        })

        if(!res.data.avatars[0].avatarId){
            setAvatar(false)
        }
    }

    async function submitAvatar(){
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/avatar`,{
            imageUrl,
            name
        },{
            headers:{
                authorization: `Bearer ${signup_token}`
            }
        })

        if(res.status===200){
            navigate('/dashboard')
        }
    }

    if (signup_token) {
        return (
            <div>
                <h1>give me avatar</h1>
                {!avatar && 
                <div>
                avatar not there
                    <input type="text" onChange={(e)=>{setImageurl(e.target.value)}} />
                    <input type="text" onChange={(e)=>{setName(e.target.value)}} />
                    <button onClick={()=>{submitAvatar()}}>submit avatar</button>
                </div>}

            </div>
        )
    } 
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
                    console.log(res.data)

                    if (res.status === 200) {
                        navigate(`?signup_token=${res.data.token}`)
                        
                    }

                }}>login</button>
            </div>
        )
    
}