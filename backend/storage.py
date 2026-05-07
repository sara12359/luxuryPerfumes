from google.cloud import storage
import os
from datetime import timedelta


def generate_signed_upload_url(bucket_name: str, blob_name: str, content_type: str = "application/octet-stream", expiration_minutes: int = 15):
    """Generate a V4 signed URL for uploading a file to GCS via HTTP PUT.

    Returns a dict with `url` (signed upload URL) and `public_url` (where file will be accessible).
    Requires the service account running the app to have `roles/storage.objectCreator` or similar.
    """
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=expiration_minutes),
        method="PUT",
        content_type=content_type,
    )

    public_url = f"https://storage.googleapis.com/{bucket_name}/{blob_name}"
    return {"url": url, "public_url": public_url, "blob_name": blob_name}
