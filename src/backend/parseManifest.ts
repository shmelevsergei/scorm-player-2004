// src/backend/parseManifest.ts
import { DOMParser } from "xmldom";

export function parseManifest(manifestXml: string): string {
	const xmlDoc = new DOMParser().parseFromString(manifestXml, "text/xml");

	const resources = xmlDoc.getElementsByTagName("resource");
	const firstResource = resources[0];

	if (!firstResource) {
		throw new Error("SCORM manifest has no <resource> element");
	}

	const launch = firstResource.getAttribute("href");

	if (!launch) {
		throw new Error("SCORM launch URL (href) not found in manifest");
	}

	return launch;
}
