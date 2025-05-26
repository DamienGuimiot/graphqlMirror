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
        <div>
            <input id="username" type="text" placeholder="Username or Email..."></input>
            <input id="password" type="password" placeholder="Password..." ></input>
            <button onClick={submitForm} className="w-1/4 h-1/4 bg-purple-900">test</button>
            <p id="errorMessage" className="ErrorMessage text-red-600"></p>
        </div>
    )
}