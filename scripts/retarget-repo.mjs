// Point the plugin manifests and README at a new home for this repo (e.g. a company GitLab fork).
// Run from the repo root, then review `git diff` and commit:
//   node scripts/retarget-repo.mjs --repo https://gitlab.example.com/qa/claude-qa-agent \
//     [--owner-name "QA Team"] [--owner-url https://gitlab.example.com/qa] [--gitlab-url https://gitlab.example.com]
// --repo        new repository URL (no .git): plugin.json homepage/repository, README links + badge
// --owner-name  marketplace owner + plugin author name (default: unchanged)
// --owner-url   marketplace owner + plugin author URL (default: unchanged)
// --gitlab-url  default GitLab URL the plugin asks for at install (default: unchanged)
// Idempotent: it replaces whatever the manifests currently point to, so it can be re-run.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 2) {
  if (!argv[i].startsWith('--') || argv[i + 1] === undefined) usage(`bad argument "${argv[i]}"`);
  args[argv[i].slice(2)] = argv[i + 1];
}
for (const k of Object.keys(args)) if (!['repo', 'owner-name', 'owner-url', 'gitlab-url'].includes(k)) usage(`unknown option --${k}`);
if (!args.repo) usage('--repo is required');
for (const k of ['repo', 'owner-url', 'gitlab-url']) {
  if (args[k] !== undefined) {
    if (!/^https?:\/\/[^\s]+$/.test(args[k])) usage(`--${k} must be an http(s) URL`);
    args[k] = args[k].replace(/\.git$/, '').replace(/\/+$/, '');
  }
}

function usage(msg) {
  console.error(`✗ ${msg}\nUsage: node scripts/retarget-repo.mjs --repo <url> [--owner-name <name>] [--owner-url <url>] [--gitlab-url <url>]`);
  process.exit(1);
}

const file = p => path.join(root, p);
const readJson = p => JSON.parse(fs.readFileSync(file(p), 'utf8'));
const writeJson = (p, o) => fs.writeFileSync(file(p), JSON.stringify(o, null, 2) + '\n');

// 1. plugin.json
const plugin = readJson('.claude-plugin/plugin.json');
const oldRepo = plugin.repository.replace(/\.git$/, '').replace(/\/+$/, '');
plugin.homepage = args.repo;
plugin.repository = args.repo;
if (args['owner-name']) plugin.author.name = args['owner-name'];
if (args['owner-url']) plugin.author.url = args['owner-url'];
if (args['gitlab-url']) plugin.userConfig.gitlab_url.default = args['gitlab-url'];
writeJson('.claude-plugin/plugin.json', plugin);

// 2. marketplace.json
const market = readJson('.claude-plugin/marketplace.json');
if (args['owner-name']) market.owner.name = args['owner-name'];
if (args['owner-url']) market.owner.url = args['owner-url'];
writeJson('.claude-plugin/marketplace.json', market);

// 3. README: clone URL, marketplace add, CI badge
let readme = fs.readFileSync(file('README.md'), 'utf8');
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const oldSlug = new URL(oldRepo).pathname.slice(1);
const isGitLab = !/^https:\/\/github\.com\//.test(args.repo);
readme = readme.replace(/^\[!\[(validate|pipeline)\]\(.*\)\]\(.*\)$/m, isGitLab
  ? `[![pipeline](${args.repo}/badges/main/pipeline.svg)](${args.repo}/-/pipelines)`
  : `[![validate](${args.repo}/actions/workflows/validate.yml/badge.svg)](${args.repo}/actions/workflows/validate.yml)`);
// `/plugin marketplace add owner/repo` is GitHub shorthand; anywhere else needs the full git URL
readme = readme.replace(new RegExp(`(/plugin marketplace add )(${esc(oldSlug)}|${esc(oldRepo)}\\.git)$`, 'm'),
  `$1${isGitLab ? args.repo + '.git' : new URL(args.repo).pathname.slice(1)}`);
readme = readme.replace(new RegExp(esc(oldRepo), 'g'), args.repo);
fs.writeFileSync(file('README.md'), readme);

console.log(`✅ ${oldRepo} → ${args.repo}${args['gitlab-url'] ? `, default GitLab URL → ${args['gitlab-url']}` : ''}. Review with: git diff`);
