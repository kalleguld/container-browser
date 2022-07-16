export function asFileSize(n: number): {text:string}{
    const prefixes = ['', 'k', 'M', 'G', 'T', 'P'];
    for (let prefix of prefixes){
        if (n < 1000)
            return {
                text: n.toLocaleString(undefined, {maximumSignificantDigits: 3}) + ` ${prefix}B`,
            };
        n /= 1000;
    }
    return {
        text: n.toLocaleString(undefined, {maximumSignificantDigits: 4}) + " EB",
    };
}