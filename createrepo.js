const { Octokit } = require("octokit")

const octokit = new Octokit({ auth: process.env["GIT_TOKEN"] })

const name = process.argv[2]
const description = process.argv[3]

console.log(`creating repo ${name} [ ${description} ]`)

octokit.rest.repos.createForAuthenticatedUser({
  name,
  description,
}).then(
  result => console.log(result),
  err => console.error(err.message),
)
