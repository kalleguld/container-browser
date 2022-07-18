
export function getContainerInfo(): ContainerInfo | undefined {
    const regex = /^https\:\/\/(.*?)\.blob\.core\.windows\.net\/(.*?)[\/\?]/;
    const href = window.location.href;
    const match = regex.exec(href);
    if (!match)
        return;

    return {
        storageAccount: match[1]!,
        container: match[2]!
    }
}

interface ContainerInfo {
    storageAccount: string;
    container: string;
}