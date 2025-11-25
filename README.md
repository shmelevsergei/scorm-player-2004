# SCORM Player 2004 — Node/Browser Compatible Loader & Parser

A lightweight SCORM 2004 unpacker + manifest parser + storage adapter system.

This package allows you to:

-   Upload SCORM 2004 ZIP packages
-   Unpack them server-side (Node.js, Next.js server actions)
-   Parse imsmanifest.xml (using a Node-compatible DOM parser)
-   Save unpacked files to any storage (Supabase included)
-   Render SCORM content inside a React <ScormPlayer /> component

## 🚀 Features

✔ Supports SCORM 2004 ZIP packages
✔ Works in Node.js (backend) and Browser (frontend)
✔ SCORM ZIP unpacking using JSZip
✔ Manifest parsing using xmldom (no browser APIs)
✔ Supabase storage adapter included
✔ Ready for Next.js — Server Actions + Client Components
✔ Works with React 18 and React 19
✔ Published as a reusable NPM module

## 📦 Installation

```bash
npm install scorm-player
```

The package requires:

-   react >= 18

React is declared as a peer dependency, so it will use whatever version the project already has.

## 📁 Package Structure

```
src/
  backend/
    unpackSCORM.ts
    parseManifest.ts
    storageAdapters/
      supabaseAdapter.ts
  frontend/
    ScormPlayer.tsx
```

You can import backend utilities or frontend components separately:

### Backend

```typescript
import { unpackSCORM, parseManifest, SupabaseAdapter } from "scorm-player";
```

### Frontend

```typescript
import { ScormPlayer } from "scorm-player";
```

## 🧭 Usage — Upload SCORM Package (Next.js Server Action)

### Client Component (upload button)

```typescript
"use client";

import { useState } from "react";
import { uploadSCORMCourse } from "./actions/uploadSCORMCourse";

export default function ScormPage() {
	const [file, setFile] = useState<File | null>(null);

	return (
		<div>
			<input
				type='file'
				onChange={(e) => setFile(e.target.files?.[0] || null)}
			/>
			<button onClick={() => file && uploadSCORMCourse(file)}>
				Upload
			</button>
		</div>
	);
}
```

### Server Action (unpack + save SCORM)

```typescript
"use server";

import { unpackSCORM, parseManifest, SupabaseAdapter } from "scorm-player";

export async function uploadSCORMCourse(file: File) {
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const { files, manifestXml } = await unpackSCORM(buffer);
	const launchUrl = parseManifest(manifestXml);

	const adapter = new SupabaseAdapter(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_KEY!,
		"courses"
	);

	await adapter.uploadFolder("courses", files);

	return launchUrl;
}
```

## 🖥️ Displaying SCORM Content

```typescript
import { ScormPlayer } from "scorm-player";

export default function PlayerPage() {
	return <ScormPlayer launchUrl='courses/index.html' />;
}
```

The component uses an <iframe /> to show SCORM content.

## 🗃️ Supabase Storage Adapter

Uploads all extracted SCORM files:

```typescript
const adapter = new SupabaseAdapter(SUPABASE_URL, SUPABASE_KEY, "folderName");

await adapter.uploadFolder("folderName", files);
```

You can also write your own adapters (S3, GCP, local FS, etc.).

## 🧩 API Reference

-   `unpackSCORM(zipData: Buffer | Uint8Array)` - Unpacks a SCORM ZIP file into a dictionary of files.
-   `parseManifest(manifestXml: string)` - Locates the SCORM launch URL from imsmanifest.xml.
-   `SupabaseAdapter` - Uploads unpacked files into Supabase Storage.
-   `<ScormPlayer launchUrl="..." />` - Renders SCORM content inside an iframe.

## 🛠️ Requirements

-   Node.js 18+
-   React 18 or newer
-   Next.js (optional but supported)

## 📄 License

MIT License.

## 🎉 Done

Your SCORM Player is ready to use.
