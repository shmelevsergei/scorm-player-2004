import { SupabaseClient } from '@supabase/supabase-js';

interface ParsedSCORM {
    files: Record<string, string>;
    manifestXml: string;
}
declare function unpackSCORM(zipFile: File | Buffer): Promise<ParsedSCORM>;

declare function parseManifest(manifestXml: string): string;

declare class SupabaseAdapter {
    client: SupabaseClient;
    rootFolder: string;
    constructor(supabaseUrl: string, supabaseKey: string, rootFolder?: string);
    uploadFile(path: string, content: string | Buffer): Promise<string>;
    uploadFolder(folderPath: string, files: Record<string, string | Buffer>): Promise<void>;
    getFileUrl(path: string): string;
}

interface SCORMState {
    "cmi.location"?: string;
    "cmi.completion_status"?: string;
    "cmi.success_status"?: string;
    "cmi.score.raw"?: number;
    "cmi.progress_measure"?: number;
    "cmi.suspend_data"?: string;
}

interface ScormPlayerProps {
    launchUrl: string;
    userId: string;
    courseId: string;
    lessonId: string;
    saveProgress: (data: SCORMState) => void;
}
declare function ScormPlayer({ launchUrl, userId, courseId, lessonId, saveProgress, }: ScormPlayerProps): JSX.Element;

export { type ParsedSCORM, type SCORMState, ScormPlayer, SupabaseAdapter, parseManifest, unpackSCORM };
