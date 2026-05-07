async function uploadFile(file) {
    const statusEl = document.getElementById('upload-status');
    statusEl.textContent = 'Preparing upload...';

    try {
        const formData = new FormData();
        formData.append('file', file);

        statusEl.textContent = 'Uploading...';

        const res = await fetch('/upload-image', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Upload failed');
        }

        if (!data.public_url) {
            throw new Error('Upload failed');
        }

        statusEl.innerHTML = `Upload complete. File available at <a href="${data.public_url}" target="_blank">${data.public_url}</a>`;
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
