export function asFileSize(n: number): {text:string}{
    const prefixes = ['k', 'M', 'G', 'T', 'P', 'E'];
    let prefix = '';
    for (let nextPrefix of prefixes){
        if (n < 1000){
            break;
        }

        prefix = nextPrefix;
        n /= 1000;
    }
    return {
        text: n.toLocaleString(undefined, {maximumSignificantDigits: 3}) + ` ${prefix}B`,
    };
}