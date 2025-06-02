"use client"

import { useRouter } from "next/navigation"

// import "https://github.com/graphql/graphiql"
export default function Loginform() {
    const router = useRouter()

    const submitForm = async () => {
        let inputUser = document.querySelector("#username")
        let inputPass = document.querySelector("#password")
        let userOrMail = inputUser.value
        let password = inputPass.value
        // console.log(userOrMail, password)

        let jwt = await fetch("https://zone01normandie.org/api/auth/signin", {
            method: "POST",
            headers: {
                authorization: "Basic " + btoa(userOrMail+":"+password)
            }
        })
        if(jwt.status == 200) {
            console.log("ok")
            jwt.json().then(data => localStorage.setItem("logToken", data))
            
            router.push("/profile")
        } else {
            inputUser.value = ""
            inputPass = ""
            document.querySelector("#errorMessage").textContent = "Invalid credentials"
        }
    }

    return(
        <div className="w-screen h-screen grid place-items-center">
            <div className="bg-gray-100 w-1/3 h-min grid auto-rows-min items-center justify-items-center gap-y-6 py-10 rounded-xl border-1 border-purple-800">
                <input id="username" type="text" placeholder="Username or Email..." className="bg-gray-300 w-3/4 min-h-3/6 p-2 rounded-xl border-1 border-purple-900 hover:bg-gray-200 focus-bg-gray-200"></input>
                <input id="password" type="password" placeholder="Password..." className="bg-gray-300 w-3/4 min-h-3/6 p-2 rounded-xl border-1 border-purple-900 hover:bg-gray-200 focus:bg-gray-200"></input>
                <p id="errorMessage" className="ErrorMessage text-red-600 mt-10"></p>
                <button onClick={submitForm} className="w-1/4 min-h-3/6 bg-purple-900 rounded-xl text-white duration-50 p-2 hover:cursor-pointer hover:scale-120">Log in</button>
            </div>
        </div>
    )
}