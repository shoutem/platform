#!/usr/bin/env bash

# Set terminal title
echo -en "\033]0;Shoutem Watcher\a"
clear

THIS_DIR=$(dirname "$0")
pushd "$THIS_DIR"
cd ../..
node "scripts/watch-local-extensions.js"
popd

echo "Process terminated. Press <enter> to close the window"
read
