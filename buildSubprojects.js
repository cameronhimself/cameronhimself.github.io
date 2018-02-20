const spawn = require('child-process-promise').spawn;
const fs = require('fs-extra')
const git = require('git-promise');
const rimraf = require('rimraf-promise');
const tmp = require('tmp-promise');
const subprojects = require('./subprojects.js');

async function buildProject(prj) {
	const name = prj.name || prj.repo;
	const pathname = prj.path || prj.repo;
	const path = `./${pathname}`;
	const repo = prj.repo || prj.path;

	// clean
	await rimraf(path);

	// mktmp
	const tmpdir = await tmp.dir();

	// clone
	console.info(`cloning ${name}...`);
	await git(`clone https://github.com/cameronhimself/${repo}.git ${tmpdir.path}`);

	// build
	console.info(`building ${name}...`);
	await spawn('npm', ['install'], { cwd: tmpdir.path });
	await spawn('npm', ['run', prj.buildCommand || 'build'], { cwd: tmpdir.path });

	// copy
	await fs.copy(`${tmpdir.path}/${prj.distdir || 'dist'}`, path);

	// clean up
	await rimraf(tmpdir.path);
	console.info(`built ${name}.`);
}

async function process() {
	subprojects.forEach(prj => buildProject(prj));
}

process();
