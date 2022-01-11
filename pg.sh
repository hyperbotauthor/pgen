###################################
# prepare repo

sep="-----------------"

printf "processing config\n%s\n" $sep

node pgen.js $*
cat exports.sh
. exports.sh
rm exports.sh

printf "%s\ncreating package folder\n" $sep

mkdir packages > /dev/null 2>&1

echo "removing $REPO"

rm packages/$REPO -rf

echo "creating $REPO"

mkdir packages/$REPO

if [ $DRY != "true" ]
then
    echo "creating git repo"
    node createrepo.js $REPO "$DESCRIPTION"
fi    


###################################
# prepare populate

shared_files=(
    "LICENSE|LICENSE"
    "getorigin.js|getorigin.js"
    "rebase.sh|rebase.sh"
    "push.sh|push.sh"
    "bump.js|bump.js"
    "auth.sh|auth.sh"
    "pub.sh|pub.sh"
    "login.js|login.js"
    "login.sh|login.sh"
    "assets/.gitignore|.gitignore"
    "assets/.prettierignore|.prettierignore"
    "assets/.prettierrc.json|.prettierrc.json"
    "assets/.gitpod.yml|.gitpod.yml"
    "assets/index.html|index.html"
)

shared_dependencies=(
    "node-fetch@2.6.5"
    "parse-git-config"
    "prettier"
    "http-server"
)

typescript_files=(
    "assets/tsconfig.json|tsconfig.json"
    "assets/rollup.config.js|rollup.config.js"
    "assets/index.test.ts|test/index.test.ts"
    "assets/jest.config.js|jest.config.js"
    "assets/index.ts|src/index.ts"
    "assets/test.js|test.js"
)

typescript_dependencies=(
    "@rollup/plugin-commonjs"
    "@rollup/plugin-node-resolve"
    "rollup-plugin-typescript2"
    "rollup"
    "typescript"
    "tslib"
    "jest"
    "ts-jest"
    "@types/jest"
)

copy_files () {    
    local meta=$1; shift
    local a=("$@")
    local IFS="|"
    printf "%s\ncopying $meta files\n$sep\n" $sep
    for file in "${a[@]}"
    do  
        fileParts=($file)        
        echo "copying ${fileParts[0]} to ${fileParts[1]}"
        cp "../../${fileParts[0]}" "${fileParts[1]}"
    done
}

install_dependencies () {  
    if [ $DRY == "true" ]; then return 1; fi    
    local meta=$1; shift
    local mode=$1; shift
    if [ "$mode" == "dev" ]; then mode=" --dev"; fi    
    local a=("$@")    
    printf "%s\ninstalling $meta dependencies\n$sep\n" $sep
    for i in "${!a[@]}"
    do  
        local mod=${a[$i]}
        echo "installing$mode $(expr $i + 1) / ${#a[@]} $mod"
        yarn add$mode $mod > /dev/null 2>&1
    done
}

###################################
# populate

echo "opening repo folder"

cd packages/$REPO

echo "creating directory structure"

mkdir src
mkdir test

echo "copying prepared package.json"

cp ../../packagejson package.json

install_dependencies "shared" "dev" "${shared_dependencies[@]}"

if [ $DO_TYPESCRIPT == "true" ]
then
    install_dependencies "typescript" "dev" "${typescript_dependencies[@]}"

    copy_files "typescript" "${typescript_files[@]}"
fi

if [ $DO_VUE == "true" ]
then
    echo "setting up vue"
    cp ../../assets/.vuerc ~
    if [ $DRY != "true" ]
    then
        yarn add --dev @vue/cli > /dev/null 2>&1
        yarn createapp
        yarn addts

        yarn add --dev rollup-plugin-vue
        yarn add --dev rollup-plugin-postcss
        yarn add --dev postcss
        yarn add --dev node-sass
        yarn add express

        cp ../../assets/rollup.config.vue.js ./rollup.config.js

        mkdir server
        cp ../../assets/api.js ./server
        cp ../../assets/server.js ./server

        cp ../../assets/vue.config.js ./
        cp ../../assets/App.vue ./src
        cp ../../assets/index.vue.ts ./src/index.ts
        cp ../../assets/HelloWorld.vue ./src/components
        cp ../../assets/api.ts ./src
        cp ../../assets/tsconfig.vue.json ./tsconfig.json
    fi  
fi

if [ $DO_NETLIFY == "true" ]
then
    echo "setting up netlify"
    if [ $DRY != "true" ]
    then
        yarn add --dev netlify-cli > /dev/null 2>&1
    fi
    cp ../../assets/netlify.toml .
    cp ../../assets/netlifyindex.html ./index.html
    mkdir netlify
    mkdir netlify/functions
    if [ $DO_TYPESCRIPT == "true" ]
    then
        yarn add @netlify/functions > /dev/null 2>&1
        cp ../../assets/netlifyindex.ts netlify/functions/
    else
        cp ../../assets/netlifyindex.js netlify/functions/
    fi
fi

copy_files "shared" "${shared_files[@]}"

echo "setting origin url"

printf "$GIT_URL" > origin.url

echo "creating readme"

printf "# $REPO\n\n$DESCRIPTION\n" > ReadMe.md

if [ $DRY != "true" ]
then
    echo "rebasing"

    . rebase.sh
fi

echo "done"

cd ../..