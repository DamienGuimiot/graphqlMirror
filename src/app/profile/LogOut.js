"use client"

import { useRouter } from "next/navigation"

export default function LogOut() {
    const router = useRouter()

    let logOutfn = () => {
        localStorage.removeItem("logToken")
        router.push("/")
    }

    return (
        <button id="logout" onClick={logOutfn} className="bg-red-600">Log Out</button>
    )
}