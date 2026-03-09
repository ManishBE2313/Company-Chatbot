# Use the official, stable Python 3.12 image (bypassing your Windows setup entirely!)
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first (this caches dependencies to make rebuilds faster)
COPY requirements.txt .

# Install the Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code into the container
COPY . .

# Expose the port FastAPI uses
EXPOSE 8000

# The command to start the server (Note: we use 0.0.0.0 so it is accessible outside the container)
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]