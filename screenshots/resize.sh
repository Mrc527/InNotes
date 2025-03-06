#!/bin/bash

# Ensure ImageMagick (IMv7) is installed
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick (IMv7) is not installed. Install it with 'brew install imagemagick'"
    exit 1
fi

# Target width and height
WIDTH=1280
HEIGHT=800

# Process all PNG files in the current directory
for file in *.png; do
    # Skip if no PNG files are found
    [ -e "$file" ] || continue

    # Skip files that already have "-res" in the name
    if [[ "$file" == *"-res.png" ]]; then
        echo "Skipping (already resized): $file"
        continue
    fi

    # Get filename without extension
    filename="${file%.*}"

    # Define output file name with "-res" appended
    output="${filename}-res.png"

    # Resize while keeping aspect ratio and pad with transparency
    magick "$file" -resize ${WIDTH}x${HEIGHT} -background none -gravity center -extent ${WIDTH}x${HEIGHT} "$output"

    echo "Resized: $file → $output"
done

echo "Batch resizing complete!"
