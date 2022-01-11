node pgen.js $*
cat exports.sh
. exports.sh
rm exports.sh

mkdir packages

echo "removing $REPO"

rm packages/$REPO -rf

echo "creating $REPO"

mkdir packages/$REPO

mv packagejson packages/$REPO/package.json
mv mitlicense packages/$REPO/LICENSE
cp getorigin.js packages/$REPO
cp rebase.sh packages/$REPO
cp push.sh packages/$REPO
cp bump.js packages/$REPO
cp auth.sh packages/$REPO
cp pub.sh packages/$REPO
cp login.js packages/$REPO
cp login.sh packages/$REPO

mkdir packages/$REPO/src

printf "node_modules/\n" > packages/$REPO/.gitignore
printf "*.log\n" >> packages/$REPO/.gitignore

printf "# $REPO\n\n$DESCRIPTION\n" > packages/$REPO/ReadMe.md

printf "" > packages/$REPO/.prettierignore
printf "{}" > packages/$REPO/.prettierrc.json

printf "$GIT_URL" > packages/$REPO/origin.url

node createrepo.js $REPO "$DESCRIPTION"

cd packages/$REPO

cp ../../assets/.gitpod.yml .

if [ $DO_TYPESCRIPT == "true" ]
then
  if [ $DRY != "true" ]
  then
    yarn add --dev @rollup/plugin-commonjs
    yarn add --dev @rollup/plugin-node-resolve
    yarn add --dev rollup-plugin-typescript2
    yarn add --dev rollup
    yarn add --dev typescript
    yarn add --dev tslib  
    yarn add --dev jest
    yarn add --dev ts-jest
    yarn add --dev @types/jest
    npx ts-jest config:init
  fi  
  mkdir test
  touch test/index.test.ts
  cp ../../assets/tsconfig.json .
  cp ../../assets/rollup.config.js .
  printf "const x: number = 1;\n\nexport { x };\n" > src/index.ts
  printf "console.log(require('./dist/index.umd.js').x)" > test.js
  cp ../../assets/index.test.ts ./test
  cp ../../assets/jest.config.js .
fi

if [ $DO_HTML == "true" ]
then
  if [ $DRY != "true"]
  then
    yarn add --dev http-server  
  fi
  cp ../../assets/index.html .  
fi

if [ $DO_NETLIFY == "true" ]
then
  if [ $DRY != "true" ]
  then
    yarn add --dev netlify-cli  
  fi
  cp ../../assets/netlify.toml .
  cp ../../assets/netlifyindex.html ./index.html
  mkdir netlify
  mkdir netlify/functions
  if [ $DO_TYPESCRIPT == "true" ]
  then
    yarn add @netlify/functions
    cp ../../assets/netlifyindex.ts netlify/functions/
  else
    cp ../../assets/netlifyindex.js netlify/functions/
  fi
fi

if [ $DO_VUE == "true" ]
then
  cp ../../assets/.vuerc ~
  cp ../../assets/vue.config.js .    
fi

if [ $DRY != "true" ]
then
  yarn add --dev "node-fetch@2.6.5"
  yarn add --dev "parse-git-config"
  yarn add --dev "prettier"  

  if [ $DO_VUE == "true" ]
  then
    yarn add --dev @vue/cli
    yarn createapp
    yarn addts
  fi

  cp ../../getorigin.js .
  bash rebase.sh
fi

cd ../..