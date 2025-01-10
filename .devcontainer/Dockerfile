# Start from a base image with Python & Node installed
FROM mcr.microsoft.com/devcontainers/python:3.11

# Install Node 18 (or another version) if not already included
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Optional: install other tools (git, etc.) if needed
RUN apt-get update && apt-get install -y git

# Make directories for backend/frontend
RUN mkdir -p /workspace/ebus-app/backend
RUN mkdir -p /workspace/ebus-app/frontend

# Set the working directory (VS Code uses /workspaces/<folder_name> by default)
WORKDIR /workspace/ebus-app

# [Optional] Pre-install Python dependencies for the backend
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --upgrade pip && pip install -r backend/requirements.txt

# [Optional] Pre-install npm dependencies for the frontend
COPY frontend/package.json frontend/package.json
RUN cd frontend && npm install

# Expose any ports you’ll need for debugging or local dev
EXPOSE 8000
EXPOSE 3000

# Done. Devcontainer will attach using this Dockerfile.
