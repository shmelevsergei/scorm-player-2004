// src/backend/unpackSCORM.ts
import JSZip from "jszip";
async function unpackSCORM(zipFile) {
  const zip = await JSZip.loadAsync(zipFile);
  const files = {};
  for (const filename of Object.keys(zip.files)) {
    const fileData = await zip.files[filename].async("string");
    files[filename] = fileData;
  }
  const manifestXml = files["imsmanifest.xml"];
  if (!manifestXml)
    throw new Error("imsmanifest.xml not found in SCORM package");
  return { files, manifestXml };
}

// src/backend/parseManifest.ts
function parseManifest(manifestXml) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(manifestXml, "text/xml");
  const resource = xml.querySelector("resource");
  if (!resource)
    throw new Error("No <resource> found in manifest");
  return resource.getAttribute("href") || "";
}

// src/backend/storageAdapters/supabaseAdapter.ts
import { createClient } from "@supabase/supabase-js";
var SupabaseAdapter = class {
  constructor(supabaseUrl, supabaseKey, rootFolder = "scorm-courses") {
    this.client = createClient(supabaseUrl, supabaseKey);
    this.rootFolder = rootFolder;
  }
  async uploadFile(path, content) {
    const fullPath = `${this.rootFolder}/${path}`;
    await this.client.storage.from(this.rootFolder).upload(path, content, { upsert: true });
    return fullPath;
  }
  async uploadFolder(folderPath, files) {
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = `${folderPath}/${filePath}`;
      await this.uploadFile(fullPath, content);
    }
  }
  getFileUrl(path) {
    return this.client.storage.from(this.rootFolder).getPublicUrl(path).data.publicUrl;
  }
};

// src/frontend/ScormPlayer.tsx
import { useEffect, useRef, useState } from "react";
import { jsx } from "react/jsx-runtime";
function ScormPlayer({
  launchUrl,
  userId,
  courseId,
  lessonId,
  saveProgress
}) {
  const iframeRef = useRef(null);
  const [scormState, setScormState] = useState({});
  useEffect(() => {
    window.API_1484_11 = {
      Initialize: () => "true",
      Terminate: () => "true",
      GetValue: (key) => scormState[key] || "",
      SetValue: (key, value) => {
        const updatedState = { ...scormState, [key]: value };
        setScormState(updatedState);
        saveProgress(updatedState);
        return "true";
      },
      Commit: () => {
        saveProgress(scormState);
        return "true";
      },
      GetLastError: () => 0,
      GetErrorString: () => "",
      GetDiagnostic: () => ""
    };
  }, [scormState, saveProgress]);
  return /* @__PURE__ */ jsx("iframe", { ref: iframeRef, src: launchUrl, width: "100%", height: "600px" });
}
export {
  ScormPlayer,
  SupabaseAdapter,
  parseManifest,
  unpackSCORM
};
