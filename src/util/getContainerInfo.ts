
export function getContainerInfo(): ContainerInfo | undefined {
    const regex = /^https\:\/\/(.*?)\.blob\.core\.windows\.net\/(.*?)[\/\?]/;
    //const href = window.location.href;
    const href = "https://kgnstorage.blob.core.windows.net/athco/browse.html#/archive";
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