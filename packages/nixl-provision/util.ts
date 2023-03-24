export function reqJson(method: string, data: unknown) {
    return {
        method,
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify(data)
    }
}
