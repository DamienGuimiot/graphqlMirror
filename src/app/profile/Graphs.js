"use client"

import { useState, useEffect } from "react"

export default function Home() {
    
    const jwt = localStorage.getItem("logToken")
    const[loading, setLoading] = useState(true)
    const[result, setResult] = useState(null)
    
    useEffect(() => {
        fetch("https://zone01normandie.org/api/graphql-engine/v1/graphql", {
                method: "POST",
                headers: {
                    authorization: `Bearer ${jwt}` 
                },
                body: JSON.stringify({
                    query: `{
                        user {
                            id
                            login
                            firstName
                            lastName
                            email
                            XPPoints: transactions_aggregate(
                                order_by: {createdAt: asc}
                                where: {type: {_eq: "xp"}, eventId: {_eq: 303}}
                                ) {
                                    aggregate {
                                        sum {
                                            amount
                                        }
                                    }
                                    nodes {
                                        amount
                                        createdAt
                                    }
                                }
                            auditRatio
                            totalUp
                            totalDown
                        }
                    }`
                }),
        }).then(data => data.json()).then(data => {
            setLoading(false)
            setResult(data)
        })
    }, [])

    if(loading) return <p>loading</p>
    if(!result) return <p>no data</p>

    // console.log(result.data.user[0].id, jwt)
    return (
        <div>
            <div id="profile">
                <p>Profile data:</p>
                <div>
                    {result.data.user[0].firstName[0] + result.data.user[0].lastName[0]}
                    <div>
                        <p>Username: {result.data.user[0].login}</p>
                        <p>Name: {result.data.user[0].firstName} {result.data.user[0].lastName}</p>
                        <p>Email: {result.data.user[0].email}</p>
                    </div>
                </div>
            </div>
            <XPGraph points={result.data.user[0].XPPoints} />
            <AuditGraph ratio={result.data.user[0].auditRatio} ups={result.data.user[0].totalUp} downs={result.data.user[0].totalDown} />
        </div>
    )
}

function AuditGraph(data) {

    const max = Math.max(data.ups, data.downs)

    return <svg viewBox="0 0 400 100" className="w-2/4 h-2/4">
        <rect x="0" y="30" height="30" width={(data.ups / max) * 400} fill="cyan"/>
        <text x="0" y="45" dominantBaseline="middle">{data.ups}</text>
        <rect x="0" y="70" height="30" width={(data.downs / max) * 400} fill="lime" />
        <text x="0" y="85" dominantBaseline="middle">{data.downs}</text>
    </svg>
}

function XPGraph(data) {
    // console.log(points)
    // console.log(data)
    let curSum = 0
    const allSum = data.points.aggregate.sum.amount
    const allPoints = data.points.nodes
    
    const epoch = Number(new Date(allPoints[0].createdAt))
    const maxTime = Number(Date.now()) - epoch
    // console.log(Number(new Date(data.points[data.points.length-1].createdAt)) - Number(new Date(data.points[0].createdAt)))


    let pathString = "M 2 500 "

    // console.log(allSum)

    allPoints.forEach( point => {
        curSum += point.amount
        
        let corX = ((Number(new Date(point.createdAt)) - epoch) / maxTime).toFixed(3) * 700
        let corY = 502 - Number(curSum / allSum).toFixed(3) * 500

        pathString += `H ${corX} V ${corY} `
    })
    pathString += `H 702`

    return (
        <svg viewBox="0 0 704 504" className="w-2/4 h-2/4">
            <path d={pathString} fill="transparent" stroke="blue" strokeWidth="3px" strokeLinejoin="bevel"/>
        </svg>
    )
}

