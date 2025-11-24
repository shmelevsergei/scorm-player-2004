# SCORM Player 2004

scorm-player is a universal module for working with SCORM 2004 packages. It works with Next.js, React, and any Node.js project.

## Features

-   Upload and unpack SCORM 2004 packages on the server
-   Save files to Supabase Storage with a customizable folder
-   Generate launch URLs for lessons or tests
-   React component ScormPlayer to embed SCORM content
-   Track user progress and save it to a database

## Installation

```bash
npm install scorm-player
```

React and ReactDOM must be installed in your project:

```bash
npm install react react-dom
npm install --save-dev @types/react @types/react-dom
```

## Backend: SCORM unpacking and uploading

```typescript
import { unpackSCORM, parseManifest } from "scorm-player/backend";
import { SupabaseAdapter } from "scorm-player/backend/storageAdapters/supabaseAdapter";

export async function uploadSCORMCourse(file: File, folderName: string) {
	const { files, manifestXml } = await unpackSCORM(file);
	const launchUrl = parseManifest(manifestXml);

	const adapter = new SupabaseAdapter(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_KEY!,
		folderName
	);

	await adapter.uploadFolder(folderName, files);

	return launchUrl;
}
```

## Frontend: React ScormPlayer component

```typescript
import { ScormPlayer } from "scorm-player/frontend";

<ScormPlayer
	launchUrl='https://xyz.supabase.co/storage/v1/object/public/my_custom_folder/index.html'
	userId={user.id}
	courseId={course.id}
	lessonId={lesson.id}
	saveProgress={async (data) => {
		await fetch("/api/scorm/saveProgress", {
			method: "POST",
			body: JSON.stringify({
				userId: user.id,
				courseId: course.id,
				lessonId: lesson.id,
				data,
			}),
		});
	}}
/>;
```

-   `launchUrl` — public URL to the main SCORM lesson HTML file
-   `saveProgress` — callback to save user progress

## Supabase Storage

Create a bucket, e.g., scorm-courses

You can set a custom folder name:

```typescript
const adapter = new SupabaseAdapter(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_KEY!,
	"my_custom_folder"
);
```

-   All SCORM files will be uploaded to the specified folder
-   `getFileUrl(path)` returns a public link to the file

## TypeScript typings

```typescript
import { SCORMState } from "scorm-player/types/scorm";

const progress: SCORMState = {
	"cmi.location": "page_3",
	"cmi.completion_status": "incomplete",
	"cmi.score.raw": 80,
};
```

## Features

-   Supports SCORM 2004 API (API_1484_11)
-   Can be used as an NPM package in any React/Next.js project
-   Frontend component and backend functions are fully decoupled
-   Custom folders in Supabase allow organizing courses flexibly

## Project structure example

```
src/
├─ backend/
│   ├─ unpackSCORM.ts
│   ├─ parseManifest.ts
│   └─ storageAdapters/supabaseAdapter.ts
├─ frontend/
│   └─ ScormPlayer.tsx
├─ types/
│   └─ scorm.ts
└─ index.ts
```

## License

MIT
