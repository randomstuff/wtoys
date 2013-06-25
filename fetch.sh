#!/bin/sh
# Fetch dependencies

mkdir -p css js img

have() {
    if ! wget "$1" -O "$2"; then
        echo "Fail to get $1 $2">&2
        exit 1
    fi
    echo "$2"
}

(while read LINE ;do
    have $LINE    
    done) > lib.txt < lib.uris

# Index to fetch by secure hash:
#sha1sum $(cat lib.txt) > lib.sha1sum
#sha256sum $(cat lib.txt) > lib.sha256sum
#sha512sum $(cat lib.txt) > lib.sha512sum
