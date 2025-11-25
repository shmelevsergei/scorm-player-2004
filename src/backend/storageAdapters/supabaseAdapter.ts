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

	// Генерация уникального имени папки
	generateUniqueFolder(baseName: string): string {
		return `${baseName}-${uuidv4()}`;
	}

	async uploadFile(path: string, content: string | Buffer) {
		const fullPath = `${this.rootFolder}/${path}`;
		await this.client.storage
			.from(this.rootFolder)
			.upload(path, content, { upsert: true });
		return fullPath;
	}

	// Принимаем files и optional baseName для папки
	async uploadFolder(
		files: Record<string, string | Buffer>,
		baseFolderName: string = "course"
	): Promise<string> {
		// Генерируем уникальное имя папки
		const uniqueFolder = this.generateUniqueFolder(baseFolderName);

		for (const [filePath, content] of Object.entries(files)) {
			const fullPath = `${uniqueFolder}/${filePath}`;
			await this.uploadFile(fullPath, content);
		}

		// Возвращаем уникальное имя папки
		return uniqueFolder;
	}

	// Получаем публичный URL полного пути к файлу
	getFileUrl(path: string): string {
		return this.client.storage.from(this.rootFolder).getPublicUrl(path).data
			.publicUrl;
	}

	// Удобная функция для получения URL к launch файлу
	getLaunchUrl(folderName: string, launchPath: string): string {
		const fullPath = `${folderName}/${launchPath}`;
		return this.getFileUrl(fullPath);
	}
}
