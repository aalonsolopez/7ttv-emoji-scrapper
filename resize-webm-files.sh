#!/bin/bash

# Define the directory
WEBM_DIR="./webm"
WEBM_OUT_DIR="./reescaled-webm"

# Check if the directory exists
if [ ! -d "$WEBM_DIR" ]; then
  echo "Directory $WEBM_DIR does not exist."
  exit 1
fi

# Loop through each file in the directory
for FILE in "$WEBM_DIR"/*; do
  # Check if it's a file
  if [ -f "$FILE" ]; then
    # Split the $FILE string using /
    IFS='/' read -ra ADDR <<< "$FILE"
    FILENAME="${ADDR[-1]}"
    
    # Print the filename
    echo "Processing file: $FILENAME"
    
    # Run ffmpeg command
    ffmpeg -c:v libvpx-vp9 -i "$FILE" -c:v libvpx-vp9 -vf scale=512:512 -auto-alt-ref 0 "$WEBM_OUT_DIR/$FILENAME"
  fi
done