export function VersionLink() {
    const version = import.meta.env.VITE_APP_VERSION ?? "0.0.0";
    
    return <a href="https://github.com/kalleguld/container-browser">
        Container browser {version}
    </a>
}