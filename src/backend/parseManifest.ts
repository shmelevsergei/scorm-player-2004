export function parseManifest(manifestXml: string): string {
	const parser = new DOMParser();
	const xml = parser.parseFromString(manifestXml, "text/xml");
	const resource = xml.querySelector("resource");
	if (!resource) throw new Error("No <resource> found in manifest");
	return resource.getAttribute("href") || "";
}
