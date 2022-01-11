var argv = require('minimist')(process.argv.slice(2));

const rfs = path => require('fs').readFileSync(path).toString()
const wfs = require('fs').writeFileSync

let config = require("./pkg.config.js")

const pkg = argv._[0] || config.defaultPackage

console.log(`generating ${pkg}`)

config = {
  ...config.global,
  ...config.packages[pkg]
}

const gitUser = config.gitUser
const gitMail = config.gitMail || `${gitUser}@gmail.com`
const gitUserHomePage = config.gitUserHomePage
const npmUser = config.npmUser || gitUser

const name = `@${npmUser}/${pkg}`
const description = config.description || pkg
const keywords = config.keywords || [pkg]
const gitUrl = `https://github.com/${gitUser}/${pkg}`

const repository = {
  type: "git",
  url: gitUrl,
}

const homepage = `${gitUrl}/#readme`

const contributors = [
  `${gitUser} <${gitMail}> (${gitUserHomePage})`
]

const bugs = {
  "url" : `${gitUrl}/issues`,
  "email" : gitMail
}

const scripts = {
  "prepare": "",
  "dev": "",
  "build": "",
  "generate": "",  
  "clean": "",
  "serve": "",
  "prettier": "prettier -w src",
  "test": "",
  "reset": "git fetch origin main && git reset --hard origin/main",
  "httpserve": "http-server",
}

if(config.typescript){
  scripts.prettier = "prettier -w src test"
  scripts.prep = "yarn prettier && yarn build"
  scripts.build = "rollup -c"
  scripts.test = "jest"
  scripts.watch = "rollup -c --watch"  
}

if(config.netlify){
  scripts.dev = "netlify dev --live"
  scripts.build = "netlify build"
  scripts.dry = "netlify build --dry"
}

if(config.vue){
  scripts.createapp = "vue create ."
  scripts.addts = "vue add typescript"
}

const exportssh = `
export REPO=${pkg}
export DESCRIPTION="${description}"
export GIT_URL=${gitUrl}
export DO_TYPESCRIPT=${!!config.typescript}
export DO_NETLIFY=${!!config.netlify}
export DO_VUE=${!!config.vue}
export DRY=${argv.d || !!argv.dry}
`

wfs("exports.sh", exportssh)

const license = config.license || "MIT"

const packagejson = {
  name,
  version: "1.0.0",
  license,
  contributors,
  description,
  keywords,
  main: "dist/index.js",
  types: "dist/index.d.ts",
  module: "",
  browser: "",  
  unpkg: "",
  bin: {},
  config: {},
  files: ["*"],
  repository,
  homepage,
  bugs,
  scripts,
  dependencies: {},
  devDependencies: {},
  peerDependencies: {},
}

wfs("packagejson", JSON.stringify(packagejson, null, 2))

const mitlicense = `MIT License

Copyright (c) ${new Date().getFullYear()} ${contributors.join(" , ")}

${rfs("MITLICENSE")}`

wfs("mitlicense", mitlicense)