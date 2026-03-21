import axios from "axios"
import { useEffect, useState } from "react"

export const Dashboard = ()=>{

    const [loading,setLoading] = useState<boolean>(true)
    const [spaces,setSpaces] = useState<object[]>([])
    const [name,setName] = useState<string>()
    const [width, setWidth] = useState<string>()
    const [height, setHeight] = useState<string>()
    const [mapId, setMapId] = useState<string>()

    useEffect(()=>{
        fetchSpace()
    },[])

    async function fetchSpace(){
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/space`,{
            name,
            width,
            height,
            mapId
        },{
            headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        console.log(res.data)
    }   

    async function HandleSubmit(){
        
    }

    return(
        <div>
            <h1>dashboard</h1>
            <input type="text" onChange={(e)=>{setName(e.target.value)}} />
            <input type="text" onChange={(e)=>{setWidth(e.target.value)}} />
            <input type="text" onChange={(e)=>{setHeight(e.target.value)}} />
            <input type="text" onChange={(e)=>{setMapId(e.target.value)}} />

            <button onClick={()=>{HandleSubmit()}}>submit</button>
        
        </div>
    )
}