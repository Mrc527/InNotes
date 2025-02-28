#!/bin/sh
xcrun /Applications/Xcode.app/Contents/Developer/usr/bin/safari-web-extension-converter --app-name InNotes --bundle-identifier ch.visn.InNotes.Safari --no-open --force build
cp -r InNotes InNotes-Safari
rm -rf InNotes
