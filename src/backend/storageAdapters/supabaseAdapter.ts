import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

	async uploadFile(path: string, content: string | Buffer) {
		const fullPath = `${this.rootFolder}/${path}`;
		await this.client.storage
			.from(this.rootFolder)
			.upload(path, content, { upsert: true });
		return fullPath;
	}

	async uploadFolder(
		folderPath: string,
		files: Record<string, string | Buffer>
	) {
		for (const [filePath, content] of Object.entries(files)) {
			const fullPath = `${folderPath}/${filePath}`;
			await this.uploadFile(fullPath, content);
		}
	}

	getFileUrl(path: string): string {
		return this.client.storage.from(this.rootFolder).getPublicUrl(path).data
			.publicUrl;
	}
}
