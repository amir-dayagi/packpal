'use client'

import { useEffect } from "react"

export default function Error({ error }: { error: Error }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return <div>
        <h1>Error</h1>
        <p>{error.message}</p>
    </div>
}