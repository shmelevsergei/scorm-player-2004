// src/backend/unpackSCORM.ts
import JSZip from "jszip";

export interface ParsedSCORM {
	files: Record<string, string>;
	manifestXml: string;
}

export async function unpackSCORM(
	zipData: Buffer | Uint8Array
): Promise<ParsedSCORM> {
	const zip = await JSZip.loadAsync(zipData);
	const files: Record<string, string> = {};

	for (const filename of Object.keys(zip.files)) {
		const file = zip.files[filename];

		if (!file) continue;
		const content = await file.async("string");
		files[filename] = content;
	}

	const manifestXml = files["imsmanifest.xml"];
	if (!manifestXml) {
		throw new Error("imsmanifest.xml not found in SCORM package");
	}

	return { files, manifestXml };
}
