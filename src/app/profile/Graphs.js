"use client"

import { useState, useEffect, useMemo} from "react"
import { useRouter } from "next/navigation"
import LogOut from "./LogOut"

export default function Graphs(data) {
    let jwt
    try {
        jwt = localStorage.getItem("logToken")
    } catch(e) {
        console.log(e)
    }

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
                            events(where: {eventId: {_eq: 303}}) {
                                level
                            }
                            skills: transactions(
                                distinct_on: type
                                where: {type: {_like: "skill_%"}}
                                order_by: [{type: asc}, {amount: desc}]
                            ) {
                                type
                                amount
                            }
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
    if(!result.user) return <p>no user</p>

    // console.log(result.data.user[0])
    return (
        <div className="w-full h-full grid place-items-center p-5 grid-cols-3 grid-rows-[repeat(4,auto)] gap-5">
            <div id="profile" className="bg-gray-100 w-full p-4 rounded-xl border-purple-900 border-1 col-start-1 col-end-4">
                <div className="w-full flex justify-between">
                    <p className="text-xl">Profile data :</p>
                    <LogOut />
                </div>
                <div className="mt-5 bg-gray-200 rounded-xl border-1 border-purple-800 p-4">
                    <div className="flex gap-6">
                        <div className="bg-purple-900 w-20 h-20 rounded-full flex justify-center items-center">
                            <p className="text-3xl text-white">{result.data.user[0].firstName[0] + result.data.user[0].lastName[0]}</p>
                        </div>
                        <div className="text-lg">
                            <p>Username: {result.data.user[0].login}</p>
                            <p>Name: {result.data.user[0].firstName} {result.data.user[0].lastName}</p>
                            <p>Email: {result.data.user[0].email}</p>
                        </div>
                    </div>
                    <LevelGraph xp={result.data.user[0].XPPoints.aggregate.sum.amount} level={result.data.user[0].events[0].level} />
                </div>
            </div>
            <div className="w-full h-min bg-gray-100 p-5 border-1 border-purple-900 rounded-xl">
                <AuditGraph ups={result.data.user[0].totalUp} downs={result.data.user[0].totalDown} />
                <p className="mt-1 text-lg">Audit ratio : {result.data.user[0].auditRatio.toFixed(2)}</p>
            </div>
            <div className="w-full h-full bg-gray-100 p-5 border-1 border-purple-900 rounded-xl col-start-2 col-end-4 row-start-2 row-end-4">
                <XPGraph points={result.data.user[0].XPPoints} />
            </div>
            <div className="w-full h-full bg-gray-100 p-5 border-1 border-purple-900 rounded-xl col-start-1 col-end-1">
                <SkillGraph skills = {result.data.user[0].skills} />
            </div>
        </div>
    )
}

function SkillGraph(data) {
    const skillNameCut = /^s.+?_/
    const skillTab = useMemo(() => {
        return data.skills
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6)
        .map(skill => ({
            type: skill.type.replace(skillNameCut, ''),
            amount: skill.amount
        }))
    }, [data.skills])

    const size = 500
    const center = size / 2
    const radius = size * 0.4
    const angles = Array.from({ length: skillTab.length }, (_, i) => 
        (i * (2 * Math.PI)) / skillTab.length - Math.PI / 2
    )
    
    const getCoordinates = (amount, angle) => {
        const scaledValue = (amount / 100) * radius
        return {
            x: center + scaledValue * Math.cos(angle),
            y: center + scaledValue * Math.sin(angle)
        }
    }

    const generatePath = () => {
        const points = skillTab.map((skill, i) => {
            const { x, y } = getCoordinates(skill.amount, angles[i])
            return `${x},${y}`
        })
        return points.length > 2 ? `M ${points.join(' L ')} Z` : ''
    }

    if (!skillTab.length){
        return null
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Best Skills Distribution</h3>
            <div className="mx-auto max-w-[500px]">
                <svg viewBox={`0 0 ${size} ${size}`}>
                    {[0.2, 0.4, 0.6, 0.8, 1].map(level => (
                        <polygon
                            key={level}
                            points={angles.map(angle => {
                                const x = center + radius * level * Math.cos(angle)
                                const y = center + radius * level * Math.sin(angle)
                                return `${x},${y}`
                            }).join(' ')}
                            fill="none"
                            stroke="#eee"
                        />
                    ))}

                    {angles.map((angle, i) => {
                        const { x, y } = getCoordinates(100, angle)
                        return (
                            <line
                                key={i}
                                x1={center}
                                y1={center}
                                x2={x}
                                y2={y}
                                stroke="#ccc"
                            />
                        )
                    })}
                    {skillTab.map((skill, i) => {
                        const { x, y } = getCoordinates(105, angles[i])
                        return (
                            <text
                                key={skill.type}
                                x={x}
                                y={y}
                                textAnchor='middle'
                                dominantBaseline="middle"
                                fontSize="24"
                            >
                                {skill.type}
                            </text>
                        )
                    })}

                    <path
                        d={generatePath()}
                        fill="rgba(91, 33, 182, 0.2)"
                        stroke="rgb(91, 33, 182)"
                        strokeWidth="2"
                    />
                </svg>
            </div>
        </div>
    )
}

function LevelGraph(data) {
    let getXP = (level) => (33 * level ** 3) + (124.5 * level ** 2) + (672.5 * level)
    let xpRange = [getXP(data.level), getXP(data.level+1)]
    
    return <svg viewBox="0 0 500 25" className="w-full">
        <line x1="10" y1="10" x2="490" y2="10" stroke="lightgray" strokeWidth="5" strokeLinecap="round" />
        <line x1="10" y1="10" x2={(data.xp - xpRange[0])/(xpRange[1]-xpRange[0])*490} y2="10" stroke="rgb(91, 33, 182)" strokeWidth="5" strokeLinecap="round" />
        <text x="5" y="25" fontSize="0.75rem">{data.level}</text>
        <text x="485" y="25" fontSize="0.75rem">{data.level+1}</text>
        <text x="250" y="20" fontSize="0.5rem" textAnchor="middle" dominantBaseline="middle">{(xpRange[1] - data.xp) + " XP until next level"}</text>
    </svg>
}

function AuditGraph(data) {

    const max = Math.max(data.ups, data.downs)

    return <svg viewBox="0 0 400 70" className="w-full">

            <rect x="0" y="0" height="30" width={(data.ups / max) * 400} fill="rgb(91, 33, 182)" rx="5" ry="5"/>
            <text x="5" y="15" dominantBaseline="middle" fill="white">{"Done: "+data.ups}</text>
            <rect x="0" y="40" height="30" width={(data.downs / max) * 400} fill="gray" rx="5" ry="5" />
            <text x="5" y="55" dominantBaseline="middle" fill="white">{"Received: "+data.downs}</text>

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


    let pathString = "M 52 502 "

    // console.log(allSum)
    let index = 0

    allPoints.forEach( point => {
        curSum += point.amount
        
        // let temp = true
        // while(temp && index < data.levels.length) {
        //     let levelGainDate = new Date(data.levels[index].createdAt)
        //     let xpGainDate = new Date(point.createdAt)
        //     // console.log(levelGainDate - xpGainDate)
        //     if(levelGainDate - xpGainDate < 1000) {
        //         // console.log(data.levels[index].amount, curSum)
        //         index++
        //     } else {
        //         temp = false
        //     }
        // }
        
        let corX = 50 + ((Number(new Date(point.createdAt)) - epoch) / maxTime).toFixed(3) * 700
        let corY = 502 - Number(curSum / allSum).toFixed(3) * 500

        pathString += `H ${corX} V ${corY} `
    })
    pathString += `H 752`

    return (
        <svg viewBox="0 0 754 554" className="w-full h-full">
            <line x1="50" y1="0" x2="50" y2="504" stroke="black" />
            <line x1="50" y1="504" x2="754" y2="504" stroke="black"/>

            <text x="20" y="20">XP</text>
            <line x1="50" y1="2" x2="754" y2="2" stroke="gray" opacity="0.6" strokeDasharray={[10, 10]} />
            <line x1="50" y1={2+ 500/4} x2="754" y2={2+ 500/4} stroke="gray" opacity="0.6" strokeDasharray={[10, 10]} />
            <line x1="50" y1={2+ 500/4*2} x2="754" y2={2+ 500/4*2} stroke="gray" opacity="0.6" strokeDasharray={[10, 10]} />
            <line x1="50" y1={2+ 500/4*3} x2="754" y2={2+ 500/4*3} stroke="gray" opacity="0.6" strokeDasharray={[10, 10]} />

            <text x="700" y="490">Date</text>
            <line x1="750" y1="500" x2="750" y2="2" stroke="gray" opacity="0.6" strokeDasharray={[20, 20]} />
            <line x1={50+ 700/4} y1="500" x2={50+ 700/4} y2="2" stroke="gray" opacity="0.6" strokeDasharray={[20, 20]} />
            <line x1={50+ 700/4*2} y1="500" x2={50+ 700/4*2} y2="2" stroke="gray" opacity="0.6" strokeDasharray={[20, 20]} />
            <line x1={50+ 700/4*3} y1="500" x2={50+ 700/4*3} y2="2" stroke="gray" opacity="0.6" strokeDasharray={[20, 20]} />

            <text x="35" y="505">0</text>
            <text x="55" y="20">{allSum}</text>

            <text x="25" y="520" >{new Date(epoch).toLocaleDateString()}</text>
            <text x="675" y="520">{new Date(Date.now()).toLocaleDateString()}</text>

            <path d={pathString} fill="transparent" stroke="rgb(91, 33, 182)" strokeWidth="3px" strokeLinejoin="bevel"/>
        </svg>
    )
}

