//var extend = require('util')._extend
const path = require('path')
const fs = require('fs')
const glob = require('glob')

function load_pgns(dir, mappings)
{
  fpath = path.join(__dirname, dir)
  files = fs.readdirSync(fpath);
  files.forEach(fname => {
    pgn = path.basename(fname, '.js')
    mappings[pgn] = require(path.join(fpath, pgn))
  });
}

var mappings = {}

load_pgns('pgns', mappings)
load_pgns('raymarine', mappings)

exports.mappings = mappings

