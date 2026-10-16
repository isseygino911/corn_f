#!/bin/sh
# Regenerates public/photos from the owner's originals. Hero is mirrored so the cob sits right of the headline.
set -e
SRC=/Users/mac/Desktop/Corn_Photos_Organized
OUT="$(dirname "$0")/../public/photos"
mkdir -p "$OUT"
conv() { sips -s format jpeg -s formatOptions "$4" -Z "$3" "$SRC/$1" --out "$OUT/$2.jpg" >/dev/null; }
conv 04_Amber_Brown/Corn_Photos/P0070.jpg ember 3000 80
sips --flip horizontal "$OUT/ember.jpg" >/dev/null
conv 14_Multicolor/Corn_Photos/P0206.jpg heirloom 1500 78
conv 09_Blue_Gray/Corn_Photos/P0173.jpg twilight 1500 78
conv 02_Yellow_Gold/Corn_Photos/P0017.jpg pearl 1500 78
# Colorway studio shots (white backdrop, multiplied onto the light stage).
STUDIO=/Users/mac/Downloads/export
studio() { sips -s format jpeg -s formatOptions 82 -Z 1500 "$STUDIO/$1" --out "$OUT/$2.jpg" >/dev/null; }
studio 02_P0006_pastel_corn_4x5.png pastel
studio 04_P0010_cream_yellow_corn_4x5.png cream
studio 05_P0013_autumn_corn_1x1.png autumn
# Process, collection and farm sections.
conv 14_Multicolor/Corn_Photos/P0208.jpg hand 1500 78
conv 02_Yellow_Gold/Cap_Details/P0028.jpg dried 1500 78
conv 09_Blue_Gray/Corn_Photos/P0177.jpg sorted 1500 78
conv 03_Peach_Orange/Round_Ornaments/P0059.jpg pearls 1500 78
conv 03_Peach_Orange/Round_Ornaments/P0063.jpg sphere 1500 78
conv 08_Purple_Lavender/Corn_Photos/P0147.jpg rosestrap 1500 78

# Transparent cutouts (macOS Vision foreground mask -> WebP with alpha) for the dark stages. Needs cwebp + magick.
CUT="$(dirname "$0")/../public/cutouts"
mkdir -p "$CUT"
TMP="$(mktemp -d)"
cutout() {
  osascript -l JavaScript "$(dirname "$0")/cutout.js" "$1" "$TMP/$2.png" >/dev/null
  magick "$TMP/$2.png" -resize 1600x1600 "$TMP/$2s.png"
  cwebp -quiet -q 82 -alpha_q 90 "$TMP/$2s.png" -o "$CUT/$2.webp"
}
cutout "$SRC/04_Amber_Brown/Corn_Photos/P0070.jpg" ember
cutout "$SRC/14_Multicolor/Corn_Photos/P0206.jpg" heirloom
cutout "$SRC/09_Blue_Gray/Corn_Photos/P0173.jpg" twilight
cutout "$SRC/02_Yellow_Gold/Corn_Photos/P0017.jpg" pearl
cutout "$SRC/03_Peach_Orange/Round_Ornaments/P0059.jpg" pearls
cutout "$STUDIO/02_P0006_pastel_corn_4x5.png" pastel
cutout "$STUDIO/04_P0010_cream_yellow_corn_4x5.png" cream
cutout "$STUDIO/05_P0013_autumn_corn_1x1.png" autumn
rm -rf "$TMP"
