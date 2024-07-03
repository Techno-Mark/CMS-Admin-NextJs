export const formatDate = (dateString: string) => {
    return new Date(dateString)
        .toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
        .replace(/(,|\s[AP]M$)/g, '')
}