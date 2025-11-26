# SCORM Player 2004 — Node/Browser Compatible Loader & Parser

A lightweight SCORM 2004 unpacker + manifest parser + storage adapter system.

This package allows you to:

Upload SCORM 2004 ZIP packages

Unpack them server-side (Node.js, Next.js server actions)

Parse imsmanifest.xml (using a Node-compatible DOM parser)

Save unpacked files to any storage (Supabase included)

Render SCORM content inside a React <ScormPlayer /> component or as a full-page course

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

react >= 18

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

## 🧭 Usage — Upload a SCORM Package (Next.js Server Action)

### Client Component (Upload Button + Get Launch Link)

```typescript
"use client";

import { useState } from "react";
import { uploadSCORMCourse } from "./actions/uploadSCORMCourse";
import { ScormPlayer } from "scorm-player";

export default function ScormPage() {
	const [file, setFile] = useState<File | null>(null);
	const [link, setLink] = useState<string>("");

	const handleUpload = async () => {
		if (!file) return;

		// Get the SCORM launch link after uploading
		const launchLink = await uploadSCORMCourse(file, "tests");
		setLink(launchLink);
		console.log("SCORM launch link:", launchLink);
	};

	return (
		<>
			<div>
				<input
					type='file'
					onChange={(e) => setFile(e.target.files?.[0] || null)}
				/>
				<button onClick={handleUpload}>Upload</button>
			</div>

			{/* Embed SCORM in an iframe */}
			{link && (
				<ScormPlayer
					launchUrl={link}
					saveProgress={(data) =>
						console.log("SCORM Progress:", data)
					}
				/>
			)}
		</>
	);
}
```

### Server Action (Unpack + Save SCORM)

```typescript
"use server";

import { unpackSCORM, parseManifest, SupabaseAdapter } from "scorm-player";

export async function uploadSCORMCourse(
	file: File,
	baseFolder: string = "course"
) {
	const buffer = Buffer.from(await file.arrayBuffer());
	const { files, manifestXml } = await unpackSCORM(buffer);

	const launchPath = parseManifest(manifestXml); // path to index.html

	const adapter = new SupabaseAdapter(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
		baseFolder
	);

	// Upload SCORM files and get a unique folder
	const uniqueFolder = await adapter.uploadFolder(files, baseFolder);

	// Form the full launch URL via API route
	const launchUrl = `/api/scorm/${uniqueFolder}/${launchPath}`;

	return launchUrl;
}
```

## 🖥️ Displaying SCORM Content

### 1️⃣ In an iframe (embedded mode)

```typescript
import { ScormPlayer } from "scorm-player";

export default function PlayerPage() {
	const launchUrl = "/api/scorm/abc123/index.html";

	return (
		<ScormPlayer
			launchUrl={launchUrl}
			saveProgress={(data) => console.log("SCORM Progress:", data)}
		/>
	);
}
```

### 2️⃣ Full-page mode (open in a separate tab)

Simply redirect the user to the SCORM API route:

```typescript
"use client";
import { useEffect } from "react";

export default function LaunchScormPage({
	searchParams,
}: {
	searchParams: { launch: string };
}) {
	useEffect(() => {
		if (searchParams.launch) {
			// Add query param ?mode=page for full-page mode
			window.location.href = `${searchParams.launch}?mode=page`;
		}
	}, [searchParams.launch]);

	return <p>Loading SCORM course...</p>;
}
```

Usage example:

```typescript
// After uploading
const launchLink = await uploadSCORMCourse(file, "tests");

// Embedded mode
<ScormPlayer launchUrl={launchLink} saveProgress={...} />

// Full-page mode
window.open(`${launchLink}?mode=page`, "_blank");
```

In full-page mode, no additional Next.js component is required — the SCORM content renders directly through the /api/scorm/... route.

## 🗃️ Supabase Storage Adapter

```typescript
const adapter = new SupabaseAdapter(SUPABASE_URL, SUPABASE_KEY, "folderName");
await adapter.uploadFolder(files, "folderName");
```

You can also write your own adapters for S3, GCP, local FS, etc.

## 🧩 API Reference

-   `unpackSCORM(zipData: Buffer | Uint8Array)` — Unpacks a SCORM ZIP file into a dictionary of files.
-   `parseManifest(manifestXml: string)` — Locates the SCORM launch URL from imsmanifest.xml.
-   `SupabaseAdapter` — Uploads unpacked files into Supabase Storage.
-   `<ScormPlayer launchUrl="..." />` — Renders SCORM content inside an iframe.

## 🛠️ Requirements

-   Node.js 18+
-   React 18+
-   Next.js 15+ (App Router)

## 📄 License

MIT License.
