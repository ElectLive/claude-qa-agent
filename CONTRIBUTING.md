# Contributing

Thanks for helping QA engineers everywhere test faster. This project is a set of Claude Code **skills** and **sub-agents**: markdown instructions plus a few templates and scripts. Most contributions are prose, and prose needs the same care as code.

## Ways to help
- **Report a problem**: a WAY that misbehaves, a template that doesn't compile, a GitLab call that fails. Use the bug report issue template and include the WAY, the trigger phrase, and what the agent did
- **Propose a WAY**: open a "New WAY / feature" issue before writing it, so we can agree on its scope and whether it's a skill or an agent
- **Improve a WAY**: tighter instructions, better defaults, clearer reports
- **Translate**: trigger keywords and docs in more languages are welcome. Keep IDs, labels and Gherkin keywords in English

## Skill or agent?
- **Skill** (`.claude/skills/<name>/SKILL.md`): runs inline in the main session. Use one for workflows (every WAY is a skill) and for rubrics or templates applied to data already in context (`bug-report`, `session-report`)
- **Agent** (`.claude/agents/<name>.md`): runs in its own context. Use one only when it reads or produces a lot (logs, diffs, many files, web pages) or needs a restricted tool list. Agents can't start other agents, so orchestration belongs in skills

## Conventions (CI enforces the starred ones)
- ★ Frontmatter is valid YAML with `name` and `description`. **Quote the description** if it contains `: ` or ` #`
- ★ The skill folder name / agent file name equals `name`
- ★ Every skill or agent listed in `CLAUDE.md` exists
- ★ Human-facing output templates end with the Output Watermark footer, and generated test files start with the watermark header (see `CLAUDE.md` → Output Watermark). This is a fixed policy, so don't remove it
- ★ The step templates in `.claude/agents/test-writer.md` compile and run (`scripts/selftest.mjs`)
- ★ **Plugin-safe.** The repo root is also the `qa-agent` plugin:
  - a new agent file must be added to the `agents` list in `.claude-plugin/plugin.json`
  - refer to files inside this repo as `${CLAUDE_PLUGIN_ROOT}/…`, never as a relative path
  - an agent that lists GitLab tools in `tools:` lists both `mcp__gitlab__<tool>` (clone) and `mcp__plugin_qa-agent_gitlab__<tool>` (plugin)
  - `CLAUDE.md` stays under ~9,500 characters, because the plugin hook injects it and Claude Code caps hook context at 10,000
- Test IDs are `Test#<nn>`. Labels come only from `gitlab-filing`'s Label Conventions table
- Outward-facing actions (closing issues, posting on MRs, quarantining, heavy load tests) need the user's confirmation unless the WAY says otherwise
- Never put real credentials, internal URLs, company names or personal data in examples. Use `myapp.com`, `user@test.local`, `#142`
- A new WAY needs: its skill, a row in `CLAUDE.md`'s routing table, a usage example and a "What the agent produces" entry in `README.md`, plus any new labels in `gitlab-filing`

## Before opening a PR
```bash
pip install pyyaml
python scripts/validate.py      # frontmatter, names, references, plugin rules, watermarks
claude plugin validate .        # marketplace + plugin manifest (Claude Code CLI)
node scripts/selftest.mjs       # templates compile + UI/a11y/visual/API scenarios run (needs Node 20+)
```
Then try your change for real in Claude Code on a sample app. Say in the PR what you ran and what happened.

## Commit style
Short imperative subject (`Add verify-fix WAY`, `Fix flaky.mjs window sort`), with a body explaining *why*. One logical change per PR.

By contributing, you agree your work is released under the [MIT License](LICENSE) and you follow the [Code of Conduct](CODE_OF_CONDUCT.md).
