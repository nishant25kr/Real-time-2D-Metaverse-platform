import axios2 from "axios"
import { useId } from "react"
import WebSocket from "ws"

const BACKEND_URL = "http://localhost:3000"
const WS_BACKEND_URL = "ws://localhost:3001"

const axios = {
    post: async (...args) => {
        try {
            const res = await axios2.post(...args)
            return res;
        } catch (e) {
            return e.response
        }
    },
    get: async (...args) => {
        try {
            const res = await axios2.get(...args)
            return res;
        } catch (e) {
            return e.response
        }
    },
    put: async (...args) => {
        try {
            const res = await axios2.put(...args)
            return res;
        } catch (e) {
            return e.response
        }
    },
    delete: async (...args) => {
        try {
            const res = await axios2.delete(...args)
            return res;
        } catch (e) {
            return e.response
        }
    },
}

// describe("Authentication", () => {
//     test("user is able to signup only once", async () => {

//         const username = "nishant" + Math.random();
//         const password = "password123"
//         const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username,
//             password,
//             type: "user"
//         })
//         expect(res.status).toBe(200)

//         const Secondres = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username,
//             password,
//             type: "user"
//         })
//         expect(Secondres.status).toBe(400)

//     })

//     test("SignIn success if the username and password is correct", async () => {
//         const username = "nishant" + Math.random()
//         const password = "password123"
//         await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username,
//             password,
//             type: "user"
//         })

//         const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username,
//             password
//         })

//         expect(res.status).toBe(200)
//         expect(res.data.token).toBeDefined()

//     })

//     test("SignIn fails if the username and password is incorrect", async () => {
//         const username = "nishant" + Math.random()
//         const password = "password123"
//         await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username,
//             password,
//             type: "user"
//         })

//         const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username: "wronguser@example.com",
//             password: "wrongpassword123"
//         })

//         expect(res.status).toBe(400)
//     })
// })




// describe("User metadata end points", () => {
//     let token = "";
//     let avatarId = "";

//     beforeAll(async () => {

//         const username = "nishant" + Math.random();
//         const password = "password123"

//         await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username,
//             password,
//             type: "admin"
//         })

//         const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username,
//             password,
//         })

//         token = res.data.token

//         const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
//             	"imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//             	"name": "Timmy"
//         },{
//             headers:{
//                 authorization: `Bearer ${token}`
//             }
//         })  

//         avatarId = avatarResponse.data.avatarId
//     })

//     test("User can't update their metadata with wrong avatar id", async () => {
//         const res = await axios.post(
//             `${BACKEND_URL}/api/v1/user/metadata`,
//             {
//                 avatarId: "143134"
//             },
//             {
//                 headers: {
//                     authorization: `Bearer ${token}`
//                 }
//             }
//         )
//         expect(400).toBe(400);
//     });

//     test("User can update there metadata wiht write avatar id", async () => {
//         const res = await axios.post(
//             `${BACKEND_URL}/api/v1/user/metadata`,
//             {
//                 avatarId
//             },
//             {
//                 headers: {
//                     authorization: `Bearer ${token}`
//                 }
//             }
//         )
//         expect(res.status).toBe(200);
//     })

//     test("User is not able to update the metadata if the auth header is not given", async () => {
//         const res = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
//             avatarId
//         })
//         expect(res.status).toBe(403);
//     })
// })


// describe("User avatar end points", () => {
//     let avatarId;
//     let token;
//     let userId;

//     beforeAll(async () => {

//         const username = "nishant" + Math.random();
//         const password = "password123"

//         const signupRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username,
//             password,
//             type: "admin"
//         })
//         userId = signupRes.data.userId
//         const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username,
//             password,
//         })

//         token = res.data.token

//         const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
//             	"imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//             	"name": "Timmy"
//         },{
//             headers:{
//                 authorization: `Bearer ${token}`
//             }
//         })  

//         avatarId = avatarResponse.data.avatarId


//         await axios.post(
//             `${BACKEND_URL}/api/v1/user/metadata`,
//             {
//                 avatarId
//             },
//             {
//                 headers: {
//                     authorization: `Bearer ${token}`
//                 }
//             }
//         )

//     })

//     test("Get back avatar information for a user", async() => {
//         const res = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=["${userId}"]`,{
//             headers:{
//                 authorization:`Bearer ${token}`
//             }
//         })
//         expect(res.data.avatars.length).toBe(1)
//         expect(res.data.avatars[0].userId).toBe(userId)
//     })

//     test("Availables avatars lists the recently created avatar", async () => {
//         const res = await axios.get(`${BACKEND_URL}/api/v1/admin/avatar`,{
//             headers:{
//                 authorization: `Bearer ${token}`
//             }
//         })
//         expect(res.data.avatars.length).not.toBe(0)
//         const currentAvatar = res.data.avatars.find(x => x.id === avatarId)
//         expect(currentAvatar).toBeDefined()
//     })

// })


// describe("Space information", () => {

//     let mapId;
//     let element1Id;
//     let element2Id;
//     let adminId;
//     let adminToken;
//     let userToken;
//     let userId;

//     beforeAll(async () => {
//         const username = "Nishant" + Math.random()
//         const password = "12345asdfa"
//         const Ad_signUpRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username,
//             password,
//             type: "admin"
//         })
//         adminId = Ad_signUpRes.data.userId

//         const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username,
//             password,
//         })

//         adminToken = res.data.token

//         const User_signUpRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username : username+"user",
//             password,
//             type: "user"
//         })
//         userId = User_signUpRes.data.userId

//         const Userres = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username : username+"user",
//             password,
//         })
//         userToken = Userres.data.token

//         const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//             width: 1,
//             height: 1,
//             static: true
//         }, {
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         })

//         const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//             width: 1,
//             height: 1,
//             static: true    
//         }, {
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         })

//         element1Id = element1.data.id
//         element2Id = element2.data.id

//         const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
//             thumbnail: "https://thumbnail.com/a.png",
//             width: 100,
//             height: 200,
//             name: "100 person interview room",
//             defaultElements: [{
//                 elementId: element1Id,
//                 x: 20,
//                 y: 20
//             }, {
//                 elementId: element2Id,
//                 x: 18,
//                 y: 20
//             }]
//         }, {
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         })
//         mapId = mapRes.data.id
//     })

//     test("User is able to create a space", async () => {

//         const res = await axios.post(`${BACKEND_URL}/api/v1/space/`,{
//             name: "test",
//             width: "500",
//             height: "400",
//             mapId: mapId
//         },{
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })


//         expect(res.data.spaceId).toBeDefined()

//     })

//     test("User is not able to create a space without dimensions and mapId", async () => {
//         const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
//             "name": "test",
//         }, {
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })

//         expect(res.status).toBe(400)
//     })

//     test("User is not able to delete a space which dosent exist", async () => {

//         const res = await axios.delete(`${BACKEND_URL}/api/v1/space/spaceId`,{
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })

//         expect(res.status).toBe(400)
//     })

//     test("User is able to delete a space which exist", async () => {

//         const SpcaeRes = await axios.post(`${BACKEND_URL}/api/v1/space`,{
//             name: "test",
//             width: "500",
//             height: "400",
//             mapId: mapId
//         },{
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })

//         const deleteRes = await axios.delete(`${BACKEND_URL}/api/v1/space/${SpcaeRes.data.spaceId}`,{
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })


//         expect(deleteRes.status).toBe(200)
//     })

//     test("User is not able to delete a space created by another user", async () => {

//         const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
//             name: "test",
//             width: "500",
//             height: "400",
//             mapId: mapId
//         },{
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         const anotherToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW1oYWxjNW4wMDA3ajIwaWkwb3FpbjZyIiwicm9sZSI6IlVzZXIiLCJpYXQiOjE3NzI5NDY1Mzh9.RgtaGpF3ia_8tmFGg8w1Bn0Q6FeZW1tR3CbU5jrnIi0"

//         const deleteres = await axios.delete(`${BACKEND_URL}/api/v1/space/${res.data.spaceId}`, {
//             headers : {
//                 authorization: `Bearer ${anotherToken}`
//             }
//         })
//         expect(deleteres.status).toBe(400)
//     })
// })


// describe("Arena information", () => {
//     let mapId;
//     let element1Id;
//     let element2Id;
//     let adminId;
//     let adminToken;
//     let userToken;
//     let userId;
//     let spaceId;


//     beforeAll(async () => {
//         const username = "Nishant" + Math.random()
//         const password = "12345asdfa"
//         const Ad_signUpRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username,
//             password,
//             type: "admin"
//         })
//         adminId = Ad_signUpRes.data.userId

//         const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username,
//             password,
//         })

//         adminToken = res.data.token

//         const User_signUpRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username : username+"user",
//             password,
//             type: "user"
//         })
//         userId = User_signUpRes.data.userId

//         const Userres = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username : username+"user",
//             password,
//         })
//         userToken = Userres.data.token

//         const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//             width: 1,
//             height: 1,
//             static: true
//         }, {
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         })

//         const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//             width: 1,
//             height: 1,
//             static: true    
//         }, {
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         })

//         element1Id = element1.data.id
//         element2Id = element2.data.id

//         const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
//             thumbnail: "https://thumbnail.com/a.png",
//             width: 100,
//             height: 200,
//             name: "100 person interview room",
//             defaultElements: [{
//                 elementId: element1Id,
//                 x: 20,
//                 y: 20
//             }, {
//                 elementId: element2Id,
//                 x: 18,
//                 y: 20
//             }]
//         }, {
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         })
//         mapId = mapRes.data.id


//         const SpaceRes = await axios.post(`${BACKEND_URL}/api/v1/space/`,{
//             name: "test",
//             width: "100",
//             height: "200",
//             mapId: mapId
//         },{
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })

//         spaceId = SpaceRes.data.spaceId;

//     })

//     test("Incorrect spaceId returns a 400", async () => {
//         const res = await axios.get(`${BACKEND_URL}/api/v1/space/a;dlf231`, {
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         expect(res.status).toBe(400)
//     })

//     test("Correct spaceId returns all the elements", async () => {
//         const res = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         const dimension = (`${res.data.space.width}x${res.data.space.height}`)
//         expect(dimension).toBe("100x200")
//         expect(res.data.element.length).toBe(2)
//     })

//     test("Delete enpoint is able to delete", async () => {
//         const res = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         const deleteRes = await axios.delete(`${BACKEND_URL}/api/v1/space/element`,{
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             },
//             data: {
//                 spaceId,
//                 elementId: res.data.element[0].id
//             }
//         })
//         const newRes = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         expect(newRes.data.element.length).toBe(1)
//     })

//     test("Adding an element work as execpted", async () => {

//         await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
//             elementId: element1Id,
//             spaceId: spaceId,
//             x: 50,
//             y: 20
//         }, {
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })

//         const newRes = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })

//         expect(newRes.data.element.length).toBe(2)
//     })

//     test("Adding an element to wrong spaceId does not work", async () => {
//         const WrondSpaceIDRes = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
//             elementId: element1Id,
//             spaceId: spaceId+"asdf",
//             x: 50,
//             y: 20
//         }, {
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         expect(WrondSpaceIDRes.status).toBe(400)
//     })



// })


// describe("Admin endpoints", () => {
//     let adminId;
//     let adminToken;
//     let userToken;
//     let userId;


//     beforeAll(async () => {
//         const username = "Nishant" + Math.random()
//         const password = "12345adsfasdf"
//         const SignUp_Res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username,
//             password,
//             type: "admin"
//         })
//         adminId = SignUp_Res.data.userId

//         const SignIn_Res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username,
//             password,
//         })

//         adminToken = SignIn_Res.data.token

//         const UserSignInRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username : username+"user",
//             password,
//             type: "user"
//         })

//         const Userres = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username : username+"user",
//             password,
//         })

//         userToken = UserSignInRes.data.token
//         userId = Userres.data.userId
//     })

//     test("User is not able to hit admin endpoints", async () => {
//         const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//             width: 1,
//             height: 1,
//             static: true
//         }, {
//             headers: {
//                 "authorization": `Bearer ${userToken}`
//             }
//         })

//         const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
//             thumbnail: "https://thumbnail.com/a.png",
//             width: 100,
//             height: 200,
//             name: "100 person interview room",
//             defaultElements: [{
//                 elementId: elementResponse.data.id,
//                 x: 20,
//                 y: 20
//             }]
//         }, {
//             headers: {
//                 "authorization": `Bearer ${userToken}`
//             }
//         })

//         const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
//             	"imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//             	"name": "Timmy"
//         },{
//             headers:{
//                 authorization: `Bearer ${userToken}`
//             }
//         })  

//         const UpdateAvatarRes = await axios.put(`${BACKEND_URL}/api/v1/admin/element`, {
//             'imageUrl': ";alskdf;ljadljf;ladfasdfasdfasdf;",
//             "name": "hello"
//         }, {
//             header: {
//                 "authorization": `Bearer ${userToken}`
//             }
//         })

//         expect(elementResponse.status).toBe(403)
//         expect(mapResponse.status).toBe(403)
//         expect(avatarResponse.status).toBe(403)
//         expect(UpdateAvatarRes.status).toBe(403)

//     })

//     test("Admin is not able to hit admin endpoints", async () => {

//         const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//             width: 1,
//             height: 1,
//             static: true
//         }, {
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         })

//         const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
//             thumbnail: "https://thumbnail.com/a.png",
//             width: 100,
//             height: 200,
//             name: "100 person interview room",
//             defaultElements: [{
//                 elementId: elementResponse.data.id,
//                 x: 20,
//                 y: 20
//             }]
//         }, {
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         })

//         const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
//             	"imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//             	"name": "Timmy"
//         },{
//             headers:{
//                 authorization: `Bearer ${adminToken}`
//             }
//         })  

//         expect(elementResponse.status).toBe(200)
//         expect(mapResponse.status).toBe(200)
//         expect(avatarResponse.status).toBe(200)

//     })


//     //Todo: not working now
//     // test("Admin is able to update the image url", async () => {

//     //     await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//     //         imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//     //         width: 1,
//     //         height: 1,
//     //         static: true
//     //     }, {
//     //         headers: {
//     //             "authorization": `Bearer ${userToken}`
//     //         }
//     //     })

//     //     const UpdateAvatarRes = await axios.put(`${BACKEND_URL}/api/v1/admin/element`, {
//     //         imageUrl: "",
//     //         name: "hello"
//     //     }, {
//     //         headers: {
//     //             "authorization": `Bearer ${adminToken}`
//     //         }
//     //     })

//     //     expect(UpdateAvatarRes.status).toBe(200)

//     // })

// })





describe("WebSocket tests", () => {
    let adminToken;
    let AdminUserId;
    let userToken;
    let UserId
    let mapId;
    let element1Id;
    let element2Id;
    let adminId;
    let userId;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages = []
    let ws2Messages = []
    let adminX;
    let adminY;
    let userX;
    let userY;

    async function HttpSetup() {
        const username = "Nishant" + Math.random()
        const password = "12345asdfa"
        const Ad_signUpRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        adminId = Ad_signUpRes.data.userId

        const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        })

        adminToken = res.data.token
        const User_signUpRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "user",
            password,
            type: "user"
        })
        userId = User_signUpRes.data.userId

        const Userres = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "user",
            password,
        })
        userToken = Userres.data.token

        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        element1Id = element1.data.id
        element2Id = element2.data.id

        const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            thumbnail: "https://thumbnail.com/a.png",
            width: 100,
            height: 200,
            name: "100 person interview room",
            defaultElements: [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
                elementId: element2Id,
                x: 18,
                y: 20
            }]
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })
        mapId = mapRes.data.id


        const SpaceRes = await axios.post(`${BACKEND_URL}/api/v1/space/`, {
            name: "test",
            width: "100",
            height: "200",
            mapId: mapId
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        spaceId = SpaceRes.data.spaceId;

    }

    function waitForAndPopLatestMessage(messageArray) {
        return new Promise((resolve) => {
            if (messageArray.length() > 0) {
                resolve(messageArray.shift())
            } else {
                let interval = setTimeout(() => {
                    if (messageArray.length > 0) {
                        resolve(messageArray.shift())
                        clearInterval(interval)
                    }
                }, 100)
            }
        })
    }

    async function WebSocketSetup() {
        console.log("inside wesocketSetup")
        ws1 = new WebSocket(WS_BACKEND_URL)
        console.log("after ws")
        ws1.onmessage = (event) => {
            console.log("got back adata 1")
            console.log(event.data)

            ws1Messages.push(JSON.parse(event.data))
        }
        console.log("after onmessage")
        await new Promise(r => {
            ws1.onopen = r
        })
        console.log("after onmessage")
        
        ws2 = new WebSocket(WS_BACKEND_URL)
        console.log("after onmessage")
        
        ws2.onmessage = (event) => {
            console.log("got back data 2")
            console.log(event.data)
            ws2Messages.push(JSON.parse(event.data))
        }
        console.log("after onmessage")
        await new Promise(r => {
            ws2.onopen = r
        })
        console.log("after onmessage")
    }

    beforeAll(async () => {
        await HttpSetup();
        await WebSocketSetup()
    })

    test("Get back ack for joining the space", () => {
        console.log("spaceID", spaceId)
        console.log("admintoken", adminToken)
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }))

        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))

        const message1 = waitForAndPopLatestMessage(ws1Messages)
        const message2 = waitForAndPopLatestMessage(ws2Messages)

        expect(message1.type).toBe("space-joined")
        expect(message2.type).toBe("space-joined")

        expect(message1.payload.users.length + message1.payload.users.length).toBe(1)

        adminX = message1.payload.spawn.x
        adminY = message1.payload.spawn.y

        userY = message2.payload.spawn.y
        userY = message2.payload.spawn.y
    })

    //     test("User should not be able to move across the boundary",()=>{
    //         ws1.send(JSON.stringify({
    //             type:"movement",
    //             payload:{
    //                 x:100000,
    //                 y:234000
    //             }
    //         }))

    //         const message = waitForAndPopLatestMessage(ws1Messages)
    //         expect(message.type).toBe("movement rejected")

    //     })

    //     test("User should not be able to move across the boundary",()=>{
    //         ws1.send(JSON.stringify({
    //             type:"movement",
    //             payload:{
    //                 x:adminX+2,
    //                 y:adminY+2
    //             }
    //         }))

    //         const message = waitForAndPopLatestMessage(ws1Messages)
    //         expect(message.type).toBe("movement rejected")

    //     })

    //     test("Correct movement sould be brodcasted to the other user",()=>{
    //         ws1.send(JSON.stringify({
    //             type:"movement",
    //             payload:{
    //                 x:adminX+1,
    //                 y:adminY+1,
    //                 userId:adminId
    //             }
    //         }))

    //         const message = waitForAndPopLatestMessage(ws1Messages)
    //         expect(message.type).toBe("movement")

    //     })

    //     test("If a user leav the other user receive a leave message",()=>{
    //         ws1.close()

    //         const message = waitForAndPopLatestMessage(ws1Messages)
    //         expect(message.type).toBe("user-left")
    //         expect(message.payload.userId).toBe(AdminUserId)

    //     })

})

