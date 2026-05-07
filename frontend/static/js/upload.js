async function getSignedUrl(filename, contentType) {
    const res = await fetch('/generate-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content_type: contentType })
    });
    return res.json();
}

async function uploadFile(file) {
    const statusEl = document.getElementById('upload-status');
    statusEl.textContent = 'Preparing upload...';

    try {
        const signed = await getSignedUrl(file.name, file.type || 'application/octet-stream');
        if (signed.error) throw new Error(signed.error);

        statusEl.textContent = 'Uploading...';

        const putRes = await fetch(signed.url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file
        });

        if (!putRes.ok) {
            throw new Error('Upload failed');
        }

        statusEl.innerHTML = `Upload complete. File available at <a href="${signed.public_url}" target="_blank">${signed.public_url}</a>`;
    } catch (err) {
        console.error(err);
        statusEl.textContent = 'Upload failed: ' + (err.message || err);
    }
}

document.getElementById('upload-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('product-file');
    if (!fileInput.files || fileInput.files.length === 0) {
        document.getElementById('upload-status').textContent = 'Please choose a file first.';
        return;
    }
    const file = fileInput.files[0];
    await uploadFile(file);
});
