#!/bin/zsh
# ci_pre_xcodebuild.sh

# Define the artifact name
artifact_name="chrome-extension"

# Define the destination directory
destination_dir="../build"

# Create the destination directory if it doesn't exist
mkdir -p "$destination_dir"

# Download the artifact
echo "Downloading Chrome Extension artifact..."
curl -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" -L "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/artifacts" > artifacts.json

# Extract the artifact ID
artifact_id=$(jq -r ".artifacts[] | select(.name == \"${artifact_name}\") | .id" artifacts.json)

# Download the artifact zip file
curl -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" -L "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/artifacts/${artifact_id}/zip" -o chrome-extension.zip

# Unzip the artifact
echo "Unzipping Chrome Extension artifact..."
unzip chrome-extension.zip -d "$destination_dir"

# Remove the zip file
rm chrome-extension.zip
rm artifacts.json

echo "Chrome Extension artifact downloaded and extracted to $destination_dir"

