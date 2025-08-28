/* script.js
   Client-side full converter:
   - Reads .mrpack (zip)
   - Finds manifest (modrinth.index.json or any .json with "files")
   - Parses file entries, tries to download each mod (CORS may block some)
   - Packages downloaded jars into mods/ and creates a basic manifest.json
   - Provides downloadable ZIP
*/

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const startBtn = document.getElementById('startBtn');
const downloadLink = document.getElementById('downloadLink');
const resetBtn = document.getElementById('resetBtn');
const statusEl = document.getElementById('status');
const logErr = document.getElementById('error');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const dropText = document.getElementById('dropText');

let selectedFile = null;
let parsedManifest = null;
let originalManifestBlob = null;

function setStatus(text) {
  statusEl.textContent = 'Status: ' + text;
}
function setError(text) {
  logErr.textContent = text;
  logErr.classList.remove('hidden');
}
function clearError() {
  logErr.classList.add('hidden');
  logErr.textContent = '';
}

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('ring-2', 'ring-teal-400');
});
dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('ring-2', 'ring-teal-400');
});
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('ring-2', 'ring-teal-400');
  if (e.dataTransfer.files && e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files.length) handleFile(e.target.files[0]);
});
resetBtn.addEventListener('click', resetAll);

function handleFile(file) {
  clearError();
  if (!file.name.endsWith('.mrpack')) {
    setError('Please provide a .mrpack file');
    return;
  }
  selectedFile = file;
  dropText.innerHTML = `<strong>Selected:</strong> ${file.name}`;
  startBtn.disabled = false;
  setStatus('Ready to convert');
}

startBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  startBtn.disabled = true;
  clearError();
  setStatus('Reading .mrpack file...');
  progressBar.classList.remove('hidden');
  progressFill.style.width = '2%';

  try {
    const zip = await JSZip.loadAsync(selectedFile);
    // find likely manifest file
    let manifestFile = null;
    const names = Object.keys(zip.files);

    // Try common names
    const tryNames = ['modrinth.index.json', 'manifest.json', 'index.json'];
    for (const t of tryNames) {
      if (names.includes(t)) {
        manifestFile = zip.files[t];
        break;
      }
      // check prefixed paths
      const found = names.find(n => n.toLowerCase().endsWith('/' + t));
      if (found) {
        manifestFile = zip.files[found];
        break;
      }
    }
    // fallback: first .json that contains "files" key
    if (!manifestFile) {
      for (const n of names) {
        if (n.toLowerCase().endsWith('.json')) {
          const txt = await zip.files[n].async('string').catch(()=>null);
          if (!txt) continue;
          try {
            const j = JSON.parse(txt);
            if (j && (j.files || j.projects || j.files_list)) {
              manifestFile = zip.files[n];
              break;
            }
          } catch(_) {}
        }
      }
    }

    if (!manifestFile) {
      setError('Manifest not found inside .mrpack. Cannot determine mod list.');
      setStatus('Failed: manifest not found');
      startBtn.disabled = false;
      progressBar.classList.add('hidden');
      return;
    }

    // keep a copy of original manifest
    originalManifestBlob = new Blob([await manifestFile.async('string')], {type:'application/json'});

    const manifestText = await manifestFile.async('string');
    let manifestJson;
    try {
      manifestJson = JSON.parse(manifestText);
    } catch (e) {
      setError('Manifest JSON parsing error.');
      startBtn.disabled = false;
      progressBar.classList.add('hidden');
      return;
    }

    parsedManifest = manifestJson;
    setStatus('Parsed manifest — extracting file list');
    progressFill.style.width = '8%';

    // Extract candidate download entries
    // Many mrpack variants include something like: files: [{path, downloads: {sha1, url}}, ...]
    // We'll try to find URLs in manifest using several heuristics.
    let entries = [];

    if (Array.isArray(manifestJson.files) && manifestJson.files.length) {
      // common shape
      for (const f of manifestJson.files) {
        // try common locations
        if (f.downloads && typeof f.downloads === 'object') {
          // downloads might be array or object
          if (Array.isArray(f.downloads)) {
            for (const d of f.downloads) if (d.url) entries.push({url: d.url, filename: f.path || d.filename || null});
          } else {
            // object keys
            if (f.downloads.url) entries.push({url: f.downloads.url, filename: f.path || f.downloads.filename || null});
            // or nested map
            for (const k in f.downloads) {
              const candidate = f.downloads[k];
              if (candidate && candidate.url) entries.push({url: candidate.url, filename: f.path || candidate.filename || null});
            }
          }
        }
        if (f.url) entries.push({url: f.url, filename: f.path || null});
        if (f.filename) entries.push({url: f.filename, filename: f.path || f.filename});
        // some manifests have 'project' + 'file' ids instead of direct url; we can't resolve without API/proxy
        if (f.project && f.file) {
          // store as info so user can see unresolved entries
          entries.push({project: f.project, file: f.file, info: true});
        }
      }
    }

    // Some manifests use "files" as objects keyed by name or use "projectFiles" etc.
    // Fallback scanning for any http/https strings in JSON text
    if (!entries.length) {
      const urlRegex = /https?:\/\/[^\s",\\]+/g;
      const found = manifestText.match(urlRegex) || [];
      for (const u of found) {
        entries.push({url: u, filename: null});
      }
    }

    if (!entries.length) {
      setError('No download URLs found in manifest. It may reference project/file IDs only which require API calls or a proxy to fetch.');
      setStatus('Failed: no download URLs found');
      startBtn.disabled = false;
      progressBar.classList.add('hidden');
      return;
    }

    // Filter only real URLs (keep unresolved project/file entries separate)
    const downloadEntries = entries.filter(e => e.url && e.url.startsWith('http'));
    const unresolved = entries.filter(e => e.info || (!e.url && (e.project || e.file)));

    setStatus(`Found ${downloadEntries.length} downloadable entries (${unresolved.length} unresolved). Starting downloads...`);
    progressFill.style.width = '12%';

    // Start downloading each URL (sequentially to reduce parallel CORS failures)
    const downloadedFiles = []; // {name, blob}
    let idx = 0;
    for (const ent of downloadEntries) {
      idx++;
      const percentageBase = 12 + Math.round((idx / downloadEntries.length) * 75);
      try {
        setStatus(`Downloading ${idx}/${downloadEntries.length} ...`);
        progressFill.style.width = `${Math.min(percentageBase, 86)}%`;

        // Try fetch with credentials omitted
        const resp = await fetch(ent.url);
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const blob = await resp.blob();

        // determine filename
        let name = ent.filename || getFileNameFromUrl(ent.url) || `file-${idx}`;
        // ensure ends with .jar if it seems like a jar
        if (!name.match(/\.[a-z0-9]{2,6}$/i)) {
          // try to infer from content-type
          const ct = resp.headers.get('Content-Type') || '';
          if (ct.includes('java') || ct.includes('application/java-archive') || ct.includes('octet-stream')) {
            name = name + '.jar';
          }
        }
        downloadedFiles.push({name, blob});
        setStatus(`Downloaded ${name} (${idx}/${downloadEntries.length})`);
      } catch (err) {
        console.error('Download error', ent, err);
        setError(`Failed to download: ${ent.url} — ${err.message}. This may be a CORS or network issue.`);
        // stop further downloads to avoid partial outputs — you can continue if preferred
        startBtn.disabled = false;
        progressBar.classList.add('hidden');
        return;
      }
    }

    // Build new zip
    setStatus('Packaging ZIP...');
    progressFill.style.width = '90%';
    const outZip = new JSZip();

    // Add mods folder
    const modsFolder = outZip.folder('mods');
    for (const f of downloadedFiles) {
      // add blob as file
      await modsFolder.file(f.name, f.blob);
    }

    // Add original manifest copy
    if (originalManifestBlob) {
      outZip.file('original_manifest.json', originalManifestBlob);
    }

    // Create a basic manifest.json for importer
    const generatedManifest = generateSimpleManifest(parsedManifest, downloadedFiles);
    outZip.file('manifest.json', JSON.stringify(generatedManifest, null, 2));

    // Optionally add a README
    const readme = {
      note: "This zip was generated from a .mrpack by Mrpack To Zip Converter. If mod downloads were skipped due to CORS, provide a server proxy or fetch the mod jars and add them into mods/ before importing."
    };
    outZip.file('README.json', JSON.stringify(readme, null, 2));

    const blob = await outZip.generateAsync({type: 'blob'}, metadataProgress => {
      // metadataProgress.percent available
      const pct = 90 + Math.round((metadataProgress.percent / 100) * 10);
      progressFill.style.width = `${pct}%`;
    });

    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = (selectedFile.name.replace(/\.mrpack$/i, '') || 'converted') + '.zip';
    downloadLink.classList.remove('hidden');
    setStatus('Conversion complete — ready to download');
    progressFill.style.width = '100%';
    startBtn.disabled = false;

  } catch (err) {
    console.error(err);
    setError('Unexpected error: ' + (err.message || err));
    setStatus('Failed');
    startBtn.disabled = false;
    progressBar.classList.add('hidden');
  }
});

function resetAll() {
  selectedFile = null;
  parsedManifest = null;
  originalManifestBlob = null;
  downloadLink.classList.add('hidden');
  startBtn.disabled = true;
  dropText.innerHTML = `Click or drag & drop a <strong>.mrpack</strong> file here`;
  setStatus('Waiting for file...');
  clearError();
  progressBar.classList.add('hidden');
  progressFill.style.width = '0%';
}

function getFileNameFromUrl(u) {
  try {
    const url = new URL(u);
    const p = url.pathname.split('/');
    const last = p[p.length - 1];
    return last || null;
  } catch (_) {
    return null;
  }
}

// Basic manifest generator: tries to create a simple, launcher-friendly manifest
function generateSimpleManifest(original, downloadedFiles) {
  // Try to preserve name and version
  const name = (original && (original.name || original.title)) || 'Converted Pack';
  const version = (original && (original.version || original.pack_version)) || '1.0';
  const mc = (original && (original.minecraft_version || (original.minecraft && original.minecraft.version))) || '1.16.5';
  // Create files array with file names
  const files = downloadedFiles.map(f => ({file: `mods/${f.name}`, filename: f.name}));

  // Minimal CurseForge-like manifest (not full spec, but importers can read basic info)
  const manifest = {
    name,
    version,
    minecraft: {
      version: mc,
      modLoaders: [
        {id: (original && original.modloader) || 'fabric', primary: true}
      ]
    },
    files,
    generatedBy: 'Mrpack To Zip Converter (client-side)',
    createdAt: new Date().toISOString()
  };
  return manifest;
}