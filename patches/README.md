# Patching platform dependency packages

1. Run `shoutem configure` @shoutem/cli command

- this is so the dependency is installed, so it can be edited

2. Edit the file(s) you need to in `node_modules`

- make the changes you want the patch to apply

3. Run `npx patch-package edited-package-name patches`

- this will create a file `edited-package-name+X.Y.Z.patch` in the `patches` directory

This patch will be applied during the execution of the platform's `postinstall` script.
