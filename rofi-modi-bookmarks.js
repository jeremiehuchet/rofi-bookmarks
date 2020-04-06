#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const { homedir } = require('os')

function toBookmarksList(rawBookmarks) {
  return Object.entries(rawBookmarks.roots)
    .flatMap(([rootDirName, content]) => visit(content, ''))
}

function visit(item, folder) {
  if (item.children) {
    return item.children.flatMap(i => visit(i, `${folder}/${item.name}`))
  } else if (item.url) {
    return visitBookmarkEntry(item, folder)
  }
}

function visitBookmarkEntry(bookmark, folder) {
  const bookmarkFolder = folder.replace(/^\/Bookmarks bar\//, '').replace(/^\//, '')
  return {
    name: `${bookmarkFolder}/${bookmark.name}`,
    url: bookmark.url,
    lastAccess: parseInt(bookmark.meta_info && bookmark.meta_info.last_visited || 0),
  }
}

function fileExists(path) {
    try {
      return fs.statSync(path).isFile()
    } catch (ignore) {
      return false
    }
}

const bookmarks = fs.readdirSync(`${homedir()}/.config/google-chrome`)
  .map(dir => `${homedir()}/.config/google-chrome/${dir}/Bookmarks`)
  .filter(fileExists)
  .map(bmFile => fs.readFileSync(bmFile))
  .map(JSON.parse)
  .flatMap(toBookmarksList)

if (process.argv.length === 2) {
  console.log(
    bookmarks
      .sort((a, b) => a.lastAccess > b.lastAccess)
      .map(bm => bm.name)
      .join('\n')
  )
} else if (process.argv.length === 3) {
  const selection = process.argv[2]
  const url = bookmarks.find(bm => bm.name === selection).url
  const subprocess = spawn('xdg-open', [url], {
    detached: true,
    stdio: 'ignore'
  });
  subprocess.unref();
} else {
  console.log("can't parse arguments", process.argv)
}
