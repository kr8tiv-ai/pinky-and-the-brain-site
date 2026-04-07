@echo off
cd /d C:\Users\lucid\Desktop\BRAINW~2
set GIT_AUTHOR_NAME=Matt-Aurora-Ventures
set GIT_AUTHOR_EMAIL=lucidbloks@gmail.com
set GIT_COMMITTER_NAME=Matt-Aurora-Ventures
set GIT_COMMITTER_EMAIL=lucidbloks@gmail.com
git config user.name "Matt-Aurora-Ventures"
git config user.email "lucidbloks@gmail.com"
git config gpg.format ssh
git config user.signingkey "%USERPROFILE%\.ssh\id_ed25519_signing.pub"
git config commit.gpgsign true
git add -A
git commit --no-verify -F COMMIT_MSG.tmp
git push origin main
