const re = /(\S+)\s+(\S+)/;

export const parseAuthHeader = (hdrValue: string) => {
    const matches = hdrValue.match(re);

    return matches && { scheme: matches[1], value: matches[2] };
}