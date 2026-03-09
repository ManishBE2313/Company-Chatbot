# Use the official, stable Python 3.12 image
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first
COPY requirements.txt .

# Install the Python packages WITH a 1000-second timeout limit
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# Copy the rest of your backend code into the container
COPY . .

# Expose the port FastAPI uses
EXPOSE 8000

# The command to start the server
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]