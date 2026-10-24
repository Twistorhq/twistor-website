#!/bin/sh
# Enable the Confess pre-push gate for THIS checkout of twistor-website.
# Sets core.hooksPath to the checked-in .githooks directory (checkout-local
# config only; it never touches other clones or worktrees).
# Disable later with: git config --unset core.hooksPath
set -e
cd "$(git rev-parse --show-toplevel)"

if [ ! -x .githooks/pre-push ]; then
  echo "error: .githooks/pre-push missing or not executable" >&2
  exit 1
fi
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)' || {
  echo "error: Confess hook needs Python 3.9+" >&2
  exit 1
}

git config core.hooksPath .githooks
echo "Confess gate enabled for this checkout (core.hooksPath=.githooks)."
echo "Pushes carrying AI co-author markers will pause for three questions."
echo "Hotfix path: CONFESS_SKIP=1 CONFESS_SKIP_REASON=\"reason\" git push (recorded)."
