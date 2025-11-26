import JSZip from "jszip";

export interface ParsedSCORM {
	files: Record<string, string | Buffer>;
	manifestXml: string;
}

export async function unpackSCORM(
	zipData: Buffer | Uint8Array
): Promise<ParsedSCORM> {
	const zip = await JSZip.loadAsync(zipData);
	const files: Record<string, string | Buffer> = {};

	for (const filename of Object.keys(zip.files)) {
		const file = zip.files[filename];
		if (!file) continue;

		// Если это папка — пропускаем
		if (file.dir) continue;

		// Определяем бинарный или текстовый файл по расширению
		const ext = filename.split(".").pop()?.toLowerCase() || "";
		const binaryExts = [
			"jpg",
			"jpeg",
			"png",
			"gif",
			"svg",
			"ico",
			"woff",
			"woff2",
			"ttf",
			"mp3",
			"mp4",
		];

		const content = binaryExts.includes(ext)
			? await file.async("nodebuffer") // бинарные файлы
			: await file.async("string"); // текстовые файлы

		files[filename] = content;
	}

	const manifestXml = files["imsmanifest.xml"];
	if (!manifestXml) {
		throw new Error("imsmanifest.xml not found in SCORM package");
	}
	// Приводим к string
	if (Buffer.isBuffer(manifestXml)) {
		return { files, manifestXml: manifestXml.toString("utf-8") };
	} else {
		return { files, manifestXml };
	}
}
