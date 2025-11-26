import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export class SupabaseAdapter {
	client: SupabaseClient;
	rootFolder: string;

	constructor(
		supabaseUrl: string,
		supabaseKey: string,
		rootFolder: string = "scorm-courses"
	) {
		this.client = createClient(supabaseUrl, supabaseKey);
		this.rootFolder = rootFolder;
	}

	generateUniqueFolder(baseName: string): string {
		return `${baseName}-${uuidv4()}`;
	}

	async uploadFile(path: string, content: string | Buffer) {
		const fullPath = `${this.rootFolder}/${path}`;

		// content может быть Buffer или string
		const fileContent =
			typeof content === "string"
				? Buffer.from(content, "utf-8")
				: content;

		await this.client.storage
			.from(this.rootFolder)
			.upload(path, fileContent, { upsert: true });

		return fullPath;
	}

	async uploadFolder(
		files: Record<string, string | Buffer>,
		baseFolderName: string = "course"
	): Promise<string> {
		const uniqueFolder = this.generateUniqueFolder(baseFolderName);

		for (const [filePath, content] of Object.entries(files)) {
			const fullPath = `${uniqueFolder}/${filePath}`;
			await this.uploadFile(fullPath, content);
		}

		return uniqueFolder;
	}

	getFileUrl(path: string): string {
		return this.client.storage.from(this.rootFolder).getPublicUrl(path).data
			.publicUrl;
	}

	getLaunchUrl(folderName: string, launchPath: string): string {
		const fullPath = `${folderName}/${launchPath}`;
		return this.getFileUrl(fullPath);
	}
}
