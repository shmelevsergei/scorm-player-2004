"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ScormPlayer: () => ScormPlayer,
  SupabaseAdapter: () => SupabaseAdapter,
  parseManifest: () => parseManifest,
  unpackSCORM: () => unpackSCORM
});
module.exports = __toCommonJS(src_exports);

// src/backend/unpackSCORM.ts
var import_jszip = __toESM(require("jszip"));
async function unpackSCORM(zipFile) {
  const zip = await import_jszip.default.loadAsync(zipFile);
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
var import_supabase_js = require("@supabase/supabase-js");
var SupabaseAdapter = class {
  constructor(supabaseUrl, supabaseKey, rootFolder = "scorm-courses") {
    this.client = (0, import_supabase_js.createClient)(supabaseUrl, supabaseKey);
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
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function ScormPlayer({
  launchUrl,
  userId,
  courseId,
  lessonId,
  saveProgress
}) {
  const iframeRef = (0, import_react.useRef)(null);
  const [scormState, setScormState] = (0, import_react.useState)({});
  (0, import_react.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", { ref: iframeRef, src: launchUrl, width: "100%", height: "600px" });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ScormPlayer,
  SupabaseAdapter,
  parseManifest,
  unpackSCORM
});
