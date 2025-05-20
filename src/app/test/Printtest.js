export default function Printtest() {
    let abc = () => {
        console.log("abc")
    }

    return (
        <button onClick={abc()} className="w-1/4 h-1/4"></button>
    )
}

