#!/bin/bash
set -e

# Parse arguments
BEAN="${1:-pbean}"
ARCH="${2:-x86_64}"

# Configuration
# Read version from flake.nix
VERSION=$(grep -m1 'version = ' flake.nix | sed 's/.*version = "\([^"]*\)".*/\1/')
ARCH_NAME="${ARCH}"
# Normalize arch names: x86_64 -> x64, aarch64 -> arm64
case "$ARCH" in
    x86_64) ARCH_NAME="x64" ;;
    aarch64) ARCH_NAME="arm64" ;;
esac

case "$BEAN" in
    pbean)
        DISPLAY_NAME=$(echo 'UGhvdG9wZWE=' | base64 -d)
        DESCRIPTION=$(echo 'UmFzdGVyIGdyYXBoaWNzIGVkaXRvcg==' | base64 -d)
        ;;
    vbean)
        DISPLAY_NAME=$(echo 'VmVjdG9ycGVh' | base64 -d)
        DESCRIPTION=$(echo 'VmVjdG9yIGdyYXBoaWNzIGVkaXRvcg==' | base64 -d)
        ;;
    *)
        echo "Unknown bean: $BEAN"
        exit 1
        ;;
esac

APP_NAME=${DISPLAY_NAME,,}

# Paths
BUILD_DIR="build/${BEAN}-linux-${ARCH_NAME}"
APPDIR="AppDir-${BEAN}"
OUTPUT="build/${BEAN}-${VERSION}-linux-${ARCH}.AppImage"

echo "Building AppImage for ${BEAN} (${ARCH})..."

# Cleanup
rm -rf "$APPDIR"
mkdir -p "$APPDIR"

# Copy built files
echo "Copying build files..."
cp -r "$BUILD_DIR"/* "$APPDIR/"

# Update package.json: replace BEAN with DISPLAY_NAME
if [ -f "$APPDIR/package.nw/package.json" ]; then
    echo "Updating package.json..."
    sed -i "s/$BEAN/$APP_NAME/g" "$APPDIR/package.nw/package.json"
fi


# Create AppRun wrapper
#
# Do NOT exec the binary: the AppImage runtime unmounts the embedded squashfs
# as soon as AppRun exits, but NW.js keeps chrome_crashpad_handler alive for a
# few seconds after the main process is gone. If the mount goes away first,
# those handlers fault on code pages from the vanished filesystem and die with
# SIGBUS, dumping a core on every quit. Keeping this shell alive keeps the
# mount alive until the handlers are done.
cat > "$APPDIR/AppRun" << 'EOF'
#!/bin/bash
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export PATH="${HERE}:${PATH}"
export LD_LIBRARY_PATH="${HERE}/lib:${LD_LIBRARY_PATH}"

"${HERE}/<<BINARY>>" "$@" &
APP_PID=$!
trap 'kill -TERM "$APP_PID" 2>/dev/null' TERM INT HUP

wait "$APP_PID"
STATUS=$?

# Match by exe inode; a command line may contain the path for other reasons.
# comm is a cheap builtin-read prefilter (kernel truncates it to 15 chars).
handler_ids() {
    local want p pid comm
    want=$(stat -Lc '%d:%i' "${HERE}/chrome_crashpad_handler" 2>/dev/null) || return 0
    for p in /proc/[0-9]*; do
        pid=${p##*/}
        read -r comm < "$p/comm" 2>/dev/null || continue
        [ "$comm" = chrome_crashpad ] || continue
        [ "$(stat -Lc '%d:%i' "$p/exe" 2>/dev/null)" = "$want" ] && echo "$pid"
    done
}

gone() { ! kill -0 "$APP_PID" 2>/dev/null; }

# Usually well under a second, but --monitor-self may outlive the browser by
# several seconds; cap the wait so quit can never hang indefinitely.
for _ in $(seq 1 150); do
    ids=$(handler_ids)
    [ -z "$ids" ] && gone && break
    sleep 0.1
done
ids=$(handler_ids); [ -n "$ids" ] && kill -TERM $ids 2>/dev/null
wait "$APP_PID" 2>/dev/null || true

exit "$STATUS"
EOF
sed -i "s/<<BINARY>>/$APP_NAME/g" "$APPDIR/AppRun"
chmod +x "$APPDIR/AppRun"

# Create .desktop file
cat > "$APPDIR/${APP_NAME}.desktop" << EOF
[Desktop Entry]
Name=${DISPLAY_NAME}
Comment=${DESCRIPTION}
Exec=AppRun %F
Icon=${APP_NAME}
Type=Application
Terminal=false
Categories=Graphics;
MimeType=\
image/vnd.adobe.photoshop;\
application/x-photoshop;\
application/illustrator;\
application/x-zerosize;\
image/x-xcf;\
application/x-cabri;\
application/vnd.corel-draw;\
image/png;\
image/svg+xml;\
image/x-eps;\
application/pdf;\
image/wmf;\
image/emf;\
image/jpeg;\
image/gif;\
image/webp;\
image/vnd.microsoft.icon;\
image/x-icns;\
image/bmp;\
image/avif;\
image/heif;\
image/jxl;\
image/x-portable-pixmap;\
image/x-portable-graymap;\
image/x-portable-bitmap;\
image/tiff;\
image/x-dds;\
image/x-ilbm;\
image/x-exr;\
image/x-hdr;\
image/x-tga;\
image/x-adobe-dng;\
image/x-nikon-nef;\
image/x-canon-cr2;\
image/x-canon-cr3;\
image/x-sony-arw;\
image/x-panasonic-rw2;\
image/x-fuji-raf;\
image/x-olympus-orf;\
image/x-kde-raw;\
image/apng;\
video/mp4;\
video/webm;\
video/x-matroska;
EOF

# Copy icons to standard locations
echo "Installing icons..."
mkdir -p "$APPDIR/usr/share/icons/hicolor"
for size in 16 32 64 128 256 512; do
    mkdir -p "$APPDIR/usr/share/icons/hicolor/${size}x${size}/apps"
    if [ -f "icons/${size}/${BEAN}.png" ]; then
        cp "icons/${size}/${BEAN}.png" "$APPDIR/usr/share/icons/hicolor/${size}x${size}/apps/${APP_NAME}.png"
    fi
done

# Also copy to AppDir root
cp "icons/512/${BEAN}.png" "$APPDIR/${APP_NAME}.png"

# Build AppImage (NW.js doesn't need GTK, so we skip the plugin and use appimagetool directly)
echo "Building AppImage..."

# Download appimagetool if not present
APPIMAGETOOL="appimagetool"
if [ ! -f "$APPIMAGETOOL" ]; then
    echo "Downloading appimagetool..."
    wget -q "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage" -O "$APPIMAGETOOL"
    chmod +x "$APPIMAGETOOL"
fi

# Move files to proper locations for AppImage structure
mkdir -p "$APPDIR/usr/bin" "$APPDIR/usr/lib" "$APPDIR/usr/share/applications" "$APPDIR/usr/share/pixmaps"
mv "$APPDIR"/*.so* "$APPDIR"/usr/lib/ 2>/dev/null || true

# Copy .desktop and icon to standard locations
cp "$APPDIR/${APP_NAME}.desktop" "$APPDIR/usr/share/applications/"
cp "$APPDIR/${APP_NAME}.png" "$APPDIR/usr/share/pixmaps/"

# Build with appimagetool
ARCH="$ARCH" VERSION="$VERSION" ./"$APPIMAGETOOL" "$APPDIR" "$OUTPUT"

echo "Done! Created: $OUTPUT"
