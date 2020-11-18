const fetch = require('node-fetch')
const fs = require('fs')
const readline = require('readline')
const fu = require('@aestheticbookshelf/fileutils')
const { exec } = require('child_process')
const open = require('open')

function execBash(command){
	return new Promise(resolve => {
		exec(command, (err, stdout, stderr) => {
			if(err){		
				console.error("error", err)
				resolve(false)
			}else{	   
				console.log(`stdout: ${stdout}`)
				console.log(`stderr: ${stderr}`)
				resolve(true)
			}
		})	
	})	
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function getLine(prompt){
	return new Promise(resolve => {
		rl.question(prompt, content => {
			resolve(content)
		})
	})
}

class GitHubApi{
	constructor(props){
		this.props = props || {}
		
		this.baseUrl = this.props.baseUrl || 'https://api.github.com/'
		
		this.token = this.props.token || process.env.GITHUB_API_TOKEN
		
		this.user = this.props.user
	}
	
	req(props){
		return new Promise(resolve => {
			let req = {
				method: props.method || 'POST',
				headers: {
					Authorization: "token " + this.token,
					'Content-Type': 'application/json',
					Accept: 'application/vnd.github.v3+json'
				},
				body: JSON.stringify(props.params)
			}
			
			let url = this.baseUrl + props.endpoint
			
			//console.log(url, req)
			
			fetch(url, req).then(response => response.text().then(content => {
				try{
					let blob = JSON.parse(content)
					resolve({
						status: "ok",
						ok: true,						
						responseCode: response.status,
						blob: blob
					})
				}catch(err){
					resolve({
						status: "JSON parse error",
						err: `${err}`,
						content: content
					})
				}
			},
				err => resolve({
					status: "fetch error",
					err: `${err}`
				})
			))	
		})		
	}
	
	createRepo(params){
		return this.req({
			endpoint: `user/repos`,
			params: params
		})
	}
	
	deleteRepo(name){
		return this.req({
			endpoint: `repos/${this.user}/${name}`,
			method: 'DELETE'
		})
	}
}

class GitLabApi{
	constructor(props){
		this.props = props || {}
		
		this.baseUrl = this.props.baseUrl || 'https://gitlab.com/api/v4/'
		
		this.token = this.props.token || process.env.GITLAB_API_TOKEN
		
		this.user = this.props.user
	}
	
	req(props){
		return new Promise(resolve => {
			let req = {
				method: props.method || 'POST',
				headers: {
					Authorization: "Bearer " + this.token,
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify(props.params)
			}
			
			let url = this.baseUrl + props.endpoint
			
			//console.log(url, req)
			
			fetch(url, req).then(response => response.text().then(content => {
				try{
					let blob = JSON.parse(content)
					resolve({
						status: "ok",
						ok: true,						
						responseCode: response.status,
						blob: blob
					})
				}catch(err){
					resolve({
						status: "JSON parse error",
						err: `${err}`
					})
				}
			},
				err => resolve({
					status: "fetch error",
					err: `${err}`
				})
			))	
		})		
	}
	
	createProject(params){
		return this.req({
			endpoint: `projects`,
			params: params
		})
	}
}

const { ArgumentParser } = require('argparse');

const { version } = require('./package.json');
 
const parser = new ArgumentParser({
  description: 'Npm package generator'
})

parser.add_argument('-v', '--version', { action: 'version', version })
parser.add_argument('command', {})
parser.add_argument('param1', { nargs: "?", default: "" })
parser.add_argument('--provider', { default: "github" })
parser.add_argument('--description', {})

if(process.argv.length == 2){
	parser.print_help()
	process.exit(0)
}

class App{
	constructor(props){
		this.props = props || {}
		
		this.providers = ["github", "gitlab", "npm"]
		
		this.packagesPath = "packages.json"
	}
	
	save(){
		fs.writeFileSync(this.packagesPath, JSON.stringify(this.packages, null, 2))
	}
	
	init(){
		this.packages = {}

		try{
			this.packages = JSON.parse(fs.readFileSync(this.packagesPath))
		}catch(err){
			console.log(`info: could not read packages.json`)
		}
		
		if(!this.packages.global) this.packages.global = {}
		
		this.save()
		
		return this
	}
	
	async global(){
		let defaults = {}
		
		for(let provider of this.providers){
			if(!this.packages.global[provider]) this.packages.global[provider] = {}
			for(let credential of ["user", "email"]){
				let deffault = this.packages.global[provider][credential] || defaults[credential] || null
				let value = await getLine(`${provider} ${credential} [ ${deffault} ] = `)
				let set = value || deffault
				this.packages.global[provider][credential] = set
				defaults[credential] = set
			}
		}
		
		console.log("global get to", this.packages.global)
		
		this.save()
		
		rl.close()
	}
	
	async createRepo(provider, name, description){		
		return new Promise(resolve => {
			let user = this.packages.global[provider].user
		
			console.log(`creating repo ${provider}.com/${user}/${name} [ ${description} ]`)

			if(provider == "github"){
				let gha = new GitHubApi({user: user})

				gha.createRepo({
					name: name,
					description: description
				}).then(result => {
					if(result.ok){
						if(result.responseCode != 201){
							console.log("failed", result.blob.errors)
							resolve(false)
						}else{
							console.log("done!")
							resolve(true)
						}
					}				
				})
			}

			if(provider == "gitlab"){
				let gla = new GitLabApi({user: user})

				gla.createProject({
					name: name,
					description: description
				}).then(result => {
					if(result.ok){
						if(result.responseCode != 201){
							console.log("failed", result.blob)
							resolve(false)
						}else{
							console.log("done!")
							resolve(true)
						}
					}				
				})
			}	
		})		
	}
	
	deleteRepo(provider, name){		
		let user = this.packages.global[provider].user
		
		if(provider == "github"){
			let gha = new GitHubApi({user: user})
			
			console.log(`deleting repo ${provider}.com/${user}/${name}`)

			gha.deleteRepo(name).then(result => {
				if(result.ok){
					if(result.blob.message == "Not Found"){
						console.log(`error: no such repo`)
					}else{
						console.log(`fatal`, result.blob)	
					}
				}else{
					if(result.status == "JSON parse error"){
						if(result.content == ""){
							console.log(`done!`)	
							return
						}
					}					
					
					console.log(`fatal`, result)
				}
			})
		}		
		
		if(provider == "gitlab"){
			console.log(`error: not allowed to delete repo on gitlab`)
		}
	}
	
	async create(name){
		let pkgPath = `packages/${name}`
		
		console.log(`creating package ${name}`)
		
		console.log(`creating directory ${pkgPath}`)
		
		fu.createDir(pkgPath)
		fu.createDir(`${pkgPath}/lib`)
		
		let npmUser = this.packages.global.npm.user
		
		let bin = {}
		let mainPath = `${pkgPath}/lib/${name}.js`
		bin[name] = mainPath
		
		let repoPath = `https://github.com/${this.packages.global.github.user}/${name}`
		let repoPathGitLab = `https://gitlab.com/${this.packages.global.gitlab.user}/${name}`

		let packageJson = {
			name: `@${npmUser}/${name}`,
			version: `1.0.0`,
			description: `${name}`,
			main: mainPath,
			scripts: {
				test: `echo "Error: no test specified" && exit 1`
			},
			bin: bin,
			keywords: [name],
			author: npmUser,
			license: `MIT`,
			homepage: repoPath,
			bugs: {
				url: `${repoPath}/issues`,
				email: `${this.packages.global.github.email}`
			},
			repository: {
				type: `git`,
				url: `${repoPath}.git`
			},
			dependencies: {},
			devDependencies: {}
		}
		
		console.log(`copying license`)
		
		fs.copyFileSync("LICENSE", `${pkgPath}/LICENSE`)
		
		console.log(`writing package.json`)
		
		fs.writeFileSync(`${pkgPath}/package.json`, JSON.stringify(packageJson, null, 2))
		
		console.log(`writing main`)
		
		fs.writeFileSync(mainPath, `console.log("${name}")`)
		
		console.log(`writing readme`)
		
		fs.writeFileSync(`${pkgPath}/ReadMe.md`, `# ${name}\n${name}`)
		
		console.log(`writing .gitignore`)
		
		fs.writeFileSync(`${pkgPath}/.gitignore`, `node_modules`)
		
		console.log(`creating scripts`)
		
		fu.createDir(`${pkgPath}/s`)
		
		fs.copyFileSync(`s/p`, `${pkgPath}/s/p`)
		
		fs.copyFileSync(`s/publish`, `${pkgPath}/s/publish`)
		
		fs.copyFileSync(`s/bump.js`, `${pkgPath}/s/bump.js`)
		
		await execBash(`chmod +x ${pkgPath}/s/p`)
		
		console.log(`creating repos`)
		
		await this.createRepo("github", name, name)
		await this.createRepo("gitlab", name, name)
		
		console.log(repoPath)
		await open(repoPath)
		console.log(repoPathGitLab)
		await open(repoPathGitLab)
		
		console.log(`initializing git`)
		
		fu.removeDir(`${pkgPath}/.git`)
		
		await execBash(`cd ${pkgPath} && git init`)
		
		console.log(`creating git config`)
		
		let config = `
[remote "origin"]
	url = ${repoPath}
	fetch = +refs/heads/*:refs/remotes/origin/*
[remote "gitlab"]
	url = ${repoPathGitLab}
	fetch = +refs/heads/*:refs/remotes/origin/*
`		
		let fullConfig = fs.readFileSync(`${pkgPath}/.git/config`) + "\n" + config
		
		fs.writeFileSync(`${pkgPath}/config`, fullConfig)
		fs.writeFileSync(`${pkgPath}/.git/config`, fullConfig)
		
		console.log(`creating initial commit`)
		
		await execBash(`cd ${pkgPath} && git add . -A && git commit -m "initial commit"`)
		
		console.log(`creating package done!`)
	}
	
	remove(name){
		let pkgPath = `packages/${name}`
		
		console.log(`removing package ${name}`)
		
		console.log(`removing directory ${pkgPath}`)
		
		fu.removeDir(pkgPath)
		
		console.log(`removing package done!`)
	}
	
	run(args){
		if(args.command == "global"){
			this.global()
			
			return
		}
		
		if(args.command == "createrepo"){
			this.createRepo(args.provider, args.param1, args.description || args.param1)
		}
		
		if(args.command == "deleterepo"){
			let name = args.param1
			
			if(name == "pgen"){
				console.log(`error: not allowed to delete a repo called pgen`)				
			}else{
				this.deleteRepo(args.provider, name)	
			}
		}
		
		if(args.command == "create"){
			let name = args.param1
			
			if(!name){
				console.log(`error: name required`)
			}else{
				this.create(name)	
			}
		}
		
		if(args.command == "remove"){
			let name = args.param1
			
			if(!name){
				console.log(`error: name required`)
			}else{
				this.remove(name)	
			}
		}
		
		rl.close()
	}
}

new App().init().run(parser.parse_args())