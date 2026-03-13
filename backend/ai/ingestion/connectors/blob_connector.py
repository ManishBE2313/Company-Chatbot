from azure.storage.blob import BlobServiceClient
import os

def download_from_blob(container_name, download_path):
    connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    container_client = blob_service_client.get_container_client(container_name)

    for blob in container_client.list_blobs():
        # Download each file to your local backend/data folder
        download_file_path = os.path.join(download_path, blob.name)
        with open(download_file_path, "wb") as download_file:
            download_file.write(container_client.download_blob(blob.name).readall())