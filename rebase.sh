echo "getting origin"

node getorigin.js

echo "exporting"

. exports.sh

echo "removing exports script"

rm exports.sh

echo "setting git user $GIT_USER $GIT_EMAIL"

git config --global user.name $GIT_USER
git config --global user.email $GIT_EMAIL

echo "removing .git"

rm -rf .git

echo "init repo"

git init

echo "creating main branch"

git checkout -b main

echo "adding files to commit"

git add .

echo "making initial commit"

git commit -m "Initial commit"

echo "setting pure origin to $GIT_URL"

git remote add origin $GIT_URL
git remote set-url origin $GIT_URL

echo "pushing to remote"

git push --force $GIT_PUSH_URL main

echo "done"
