#!/bin/bash


EMOTES_DIR="./emotes"
TRANSFORM_SCRIPT="./webp-to-webm-transformer.js"
TARGET_DIR="./webm"


if [ ! -d "$EMOTES_DIR" ]; then
  echo "Directory $EMOTES_DIR does not exist."
  exit 1
fi


if [ ! -d "$TARGET_DIR" ]; then
  mkdir -p "$TARGET_DIR"
fi

for FILE in "$EMOTES_DIR"/*; do
  if [ -f "$FILE" ]; then
    node "$TRANSFORM_SCRIPT" "$FILE" true

    GENERATED_FILE="${FILE%.*}.webm"

    if [ -f "$GENERATED_FILE" ]; then
      mv "$GENERATED_FILE" "$TARGET_DIR"
    else
      echo "Failed to generate $GENERATED_FILE"
    fi
  fi
done