"""Codex (and other AGENTS.md-based agents) support, generated from CLAUDE.md so there is one source of truth.

Run from the repo root:
  python scripts/codex.py build              # write ./AGENTS.md (for working on this repo with Codex)
  python scripts/codex.py check              # exit 1 if ./AGENTS.md is stale (validate.py calls this)
  python scripts/codex.py install <project>  # use the agent from Codex in <project>: skills + AGENTS.md block

CLAUDE.md is rewritten with exact replacements. Each must match exactly once, so wording drift in
CLAUDE.md fails loudly here instead of producing an AGENTS.md that still says "Skill tool".
"""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BEGIN, END = '<!-- qa-agent:begin -->', '<!-- qa-agent:end -->'

REPLACEMENTS = [
    # Claude Code plugin/clone naming → any agent reading AGENTS.md
    ("""**Plugin or clone.** As the `qa-agent` plugin, names are prefixed `qa-agent:` and GitLab tools are `mcp__plugin_qa-agent_gitlab__<tool>`. From a clone, there's no prefix, GitLab tools are `mcp__gitlab__<tool>`, and **`${CLAUDE_PLUGIN_ROOT}` in skill or agent text means the repo root**.""",
     """**Where things are.** Skills (one per WAY, plus shared ones) are `{root}/.claude/skills/<name>/SKILL.md`. Sub-agents are `{root}/.claude/agents/<name>.md`. **`${{CLAUDE_PLUGIN_ROOT}}` in their text means `{root}`**. GitLab MCP tools are written `mcp__gitlab__<tool>`: use your client's name for the `gitlab` server's `<tool>`."""),
    ("""invoke that skill with the Skill tool **before doing anything else**, then follow it.""",
     """open that skill's `SKILL.md` (your skills feature, or read the file) **before doing anything else**, then follow it."""),
    ("""- Sub-agents start with the Agent tool; skills run inline via the Skill tool. If `qa-artifacts/` or its runner is missing, run `qa-setup` first""",
     """- **Sub-agents.** When a skill says to run an agent (`test-writer`, `test-execution-agent`, …), use your sub-agent feature with `{root}/.claude/agents/<name>.md` as its instructions if you have one. Otherwise read that file and follow it inline as a procedure: keep to its `tools:` list and return what it says to return. Skills always run inline. If `qa-artifacts/` or its runner is missing, run `qa-setup` first"""),
]

CODEX_NOTES = """
---

## Running on Codex (or another AGENTS.md agent)

- The Claude Code plugin pieces (`.claude-plugin/`, `hooks/`, `claude plugin eval`) don't apply. Everything else does
- Tools named in the skills map to yours: reading/writing files, a shell for `npx playwright test`, `gh`/`az`/`k6`, web fetch, and the GitLab MCP server if `QA_TRACKER`/`QA_CODE_HOST` is `gitlab` (see `{root}/codex/config.example.toml`)
- Inline sub-agents share your context: large CI logs and MR diffs (`ci-diagnostician`, `mr-test-impact`) cost context there. Summarize as you go
"""

HEADER = """<!-- Generated from CLAUDE.md by scripts/codex.py. Don't edit by hand: edit CLAUDE.md, then run `python scripts/codex.py build`. -->

"""


def render(root_label):
    text = open(os.path.join(ROOT, 'CLAUDE.md'), encoding='utf-8').read()
    for old, new in REPLACEMENTS:
        n = text.count(old)
        if n != 1:
            sys.exit(f'codex.py: CLAUDE.md changed: expected 1 match of {old[:60]!r}…, found {n}. Update REPLACEMENTS')
        text = text.replace(old, new.format(root=root_label))
    return HEADER + text.rstrip('\n') + '\n' + CODEX_NOTES.format(root=root_label)


def build():
    open(os.path.join(ROOT, 'AGENTS.md'), 'w', encoding='utf-8').write(render('.'))
    print('wrote AGENTS.md')


def check():
    path = os.path.join(ROOT, 'AGENTS.md')
    current = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
    if current != render('.'):
        sys.exit('AGENTS.md is stale: run `python scripts/codex.py build`')
    print('AGENTS.md up to date')


def link_skills():
    """Expose every skill in the user-level skill folders Codex reads. Existing entries that aren't ours are left alone."""
    src = os.path.join(ROOT, '.claude', 'skills')
    for base in [os.path.expanduser('~/.agents/skills'), os.path.expanduser('~/.codex/skills')]:
        os.makedirs(base, exist_ok=True)
        for name in sorted(os.listdir(src)):
            target, link = os.path.join(src, name), os.path.join(base, name)
            if os.path.islink(link):
                os.remove(link)
            elif os.path.exists(link):
                print(f'  skip {link}: exists and is not a link from this install')
                continue
            os.symlink(target, link)
        print(f'linked skills into {base}')


def install(project):
    project = os.path.abspath(project)
    if not os.path.isdir(project):
        sys.exit(f'{project} is not a directory')
    link_skills()
    block = f'{BEGIN}\n{render(ROOT)}{END}\n'
    path = os.path.join(project, 'AGENTS.md')
    text = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
    if BEGIN in text and END in text:  # re-install: replace our block, keep the project's own content
        text = text[:text.index(BEGIN)] + block + text[text.index(END) + len(END):].lstrip('\n')
    else:
        text = (text.rstrip('\n') + '\n\n' if text else '') + block
    open(path, 'w', encoding='utf-8').write(text)
    print(f'wrote the qa-agent block into {path}')
    print('next: add the GitLab MCP server to ~/.codex/config.toml if you use GitLab (codex/config.example.toml), '
          'then run `qa setup` in Codex from that project')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'build':
        build()
    elif cmd == 'check':
        check()
    elif cmd == 'install' and len(sys.argv) == 3:
        install(sys.argv[2])
    else:
        sys.exit(__doc__)
