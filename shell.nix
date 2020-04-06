{ pkgs ? import <nixpkgs> { } }:

with pkgs;
mkShell {
  name = "rofi-bookmarks";
  buildInputs = [ nodejs-12_x rofi ];
}
