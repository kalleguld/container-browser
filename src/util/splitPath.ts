
export interface PartPiece{
    name:string;
    path:string
}

export function splitPath(path: string): PartPiece[]{
    if (path === "")
        return [];
    if (path === "/")
        return [];
    const split = path.split("/").slice(1);
    let pathSoFar = "";
    const result: PartPiece[] = [];
    for (const part of split) {
        pathSoFar += ("/" + part)
        result.push({
            name: part,
            path: pathSoFar
        })
    }
    return result;
}