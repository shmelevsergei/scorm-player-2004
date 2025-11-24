import JSZip from "jszip";

export interface ParsedSCORM {
	files: Record<string, string>;
	manifestXml: string;
}

export async function unpackSCORM(
	zipFile: File | Buffer
): Promise<ParsedSCORM> {
	const zip = await JSZip.loadAsync(zipFile);
	const files: Record<string, string> = {};

	for (const filename of Object.keys(zip.files)) {
		const fileData = await zip.files[filename].async("string");
		files[filename] = fileData;
	}

	const manifestXml = files["imsmanifest.xml"];
	if (!manifestXml)
		throw new Error("imsmanifest.xml not found in SCORM package");

	return { files, manifestXml };
}
