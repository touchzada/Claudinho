import { c as _c } from "react-compiler-runtime";
import * as React from 'react';
import { handlePlanModeTransition, setHasExitedPlanMode, setNeedsPlanModeExitAttachment } from '../../bootstrap/state.js';
import type { LocalJSXCommandContext } from '../../commands.js';
import { Box, Text } from '../../ink.js';
import type { LocalJSXCommandOnDone } from '../../types/command.js';
import { getExternalEditor } from '../../utils/editor.js';
import { getFsImplementation } from '../../utils/fsOperations.js';
import { toIDEDisplayName } from '../../utils/ide.js';
import { applyPermissionUpdate } from '../../utils/permissions/PermissionUpdate.js';
import { prepareContextForPlanMode } from '../../utils/permissions/permissionSetup.js';
import { getPlan, getPlanFilePath, getPlansDirectory } from '../../utils/plans.js';
import { editFileInEditor } from '../../utils/promptEditor.js';
import { renderToString } from '../../utils/staticRender.js';

function PlanDisplay(t0) {
  const $ = _c(11);
  const {
    planContent,
    planPath,
    editorName
  } = t0;
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = <Text bold={true}>Current Plan</Text>;
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== planPath) {
    t2 = <Text dimColor={true}>{planPath}</Text>;
    $[1] = planPath;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== planContent) {
    t3 = <Box marginTop={1}><Text>{planContent}</Text></Box>;
    $[3] = planContent;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  let t4;
  if ($[5] !== editorName) {
    t4 = editorName && <Box marginTop={1}><Text dimColor={true}>"/plan open"</Text><Text dimColor={true}> to edit this plan in </Text><Text bold={true} dimColor={true}>{editorName}</Text></Box>;
    $[5] = editorName;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== t2 || $[8] !== t3 || $[9] !== t4) {
    t5 = <Box flexDirection="column">{t1}{t2}{t3}{t4}</Box>;
    $[7] = t2;
    $[8] = t3;
    $[9] = t4;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  return t5;
}

function buildDeepPlanPrompt(description: string): string {
  return [
    'You are in deep local planning mode.',
    '',
    `User request: ${description}`,
    '',
    'Behave like a lightweight local ultraplan.',
    '',
    'Your job:',
    '1. Explore the codebase thoroughly before proposing changes.',
    '2. Analyze the request from these angles:',
    '   - architecture',
    '   - security',
    '   - performance',
    '   - testing',
    '   - maintainability',
    '3. Synthesize the findings into a single practical implementation plan.',
    '4. Prefer concrete file paths, exact change points, and realistic sequencing.',
    '5. Save the result as markdown in the active plan file for this session.',
    '6. End by summarizing the key points and asking the user to APPROVE, MODIFY, or DECLINE the plan.',
    '',
    'Use this markdown structure:',
    '',
    '# Plan: <short title>',
    '**Mode:** deep',
    '**Date:** <today>',
    '**Status:** draft',
    '',
    '## Architecture Analysis',
    '<findings>',
    '',
    '## Security Concerns',
    '<findings>',
    '',
    '## Performance Notes',
    '<findings>',
    '',
    '## Testing Gaps',
    '<findings>',
    '',
    '## Changes Required',
    '- **path/to/file** — what changes and why',
    '',
    '## Steps',
    '1. [ ] step with file path',
    '2. [ ] next step',
    '',
    '## Priority Matrix',
    '- **Critical**: must-do',
    '- **Important**: should-do',
    '- **Nice-to-have**: optional',
    '',
    '## Validation',
    '- tests to run',
    '- checks to run',
  ].join('\n');
}

function listPlanFiles(): string[] {
  const fs = getFsImplementation();
  const dir = getPlansDirectory();
  if (!fs.existsSync(dir)) return [];
  return fs.readdirStringSync(dir).filter(name => name.endsWith('.md')).sort();
}

function resolveRequestedPlanPath(slug?: string): string {
  const fs = getFsImplementation();
  if (!slug) return getPlanFilePath();
  const dir = getPlansDirectory();
  const normalized = slug.endsWith('.md') ? slug : `${slug}.md`;
  const full = `${dir}/${normalized}`.replace(/\\/g, '/');
  if (fs.existsSync(full)) return full;
  return getPlanFilePath();
}

export async function call(onDone: LocalJSXCommandOnDone, context: LocalJSXCommandContext, args: string): Promise<React.ReactNode> {
  const {
    getAppState,
    setAppState
  } = context;
  const appState = getAppState();
  const currentMode = appState.toolPermissionContext.mode;
  const trimmedArgs = args.trim();
  const argList = trimmedArgs ? trimmedArgs.split(/\s+/) : [];
  const primaryArg = argList[0]?.toLowerCase();

  if (primaryArg === 'off' || primaryArg === 'disable' || primaryArg === 'exit') {
    if (currentMode !== 'plan') {
      onDone('Plan mode já tá desligado.', {
        display: 'system'
      });
      return null;
    }

    handlePlanModeTransition(currentMode, 'default');
    setHasExitedPlanMode(true);
    setNeedsPlanModeExitAttachment(true);
    setAppState(prev => ({
      ...prev,
      toolPermissionContext: applyPermissionUpdate(prev.toolPermissionContext, {
        type: 'setMode',
        mode: prev.toolPermissionContext.prePlanMode ?? 'default',
        destination: 'session'
      })
    }));

    onDone('Plan mode desligado.', {
      display: 'system'
    });
    return null;
  }

  if (primaryArg === 'list') {
    const files = listPlanFiles();
    if (files.length === 0) {
      onDone('Nenhum plano salvo ainda. Quando você usar /plan e escrever um plano, ele aparece aqui.', {
        display: 'system'
      });
      return null;
    }
    onDone(`Planos salvos em ${getPlansDirectory()}\n\n- ${files.join('\n- ')}`, {
      display: 'system'
    });
    return null;
  }

  if (primaryArg === 'open') {
    const requestedSlug = argList.slice(1).join(' ').trim();
    const planPath = resolveRequestedPlanPath(requestedSlug || undefined);
    const result = await editFileInEditor(planPath);
    if (result.error) {
      onDone(`Falha ao abrir o plano no editor: ${result.error}`, {
        display: 'system'
      });
    } else {
      onDone(`Plano aberto no editor: ${planPath}`, {
        display: 'system'
      });
    }
    return null;
  }

  if (primaryArg === 'deep') {
    const description = trimmedArgs.replace(/^deep\s+/, '').trim();
    if (!description) {
      onDone('Uso: /plan deep <o que você quer planejar>', {
        display: 'system'
      });
      return null;
    }

    if (currentMode !== 'plan') {
      handlePlanModeTransition(currentMode, 'plan');
      setAppState(prev => ({
        ...prev,
        toolPermissionContext: applyPermissionUpdate(prepareContextForPlanMode(prev.toolPermissionContext), {
          type: 'setMode',
          mode: 'plan',
          destination: 'session'
        })
      }));
    }

    onDone('Plan mode ligado. Bora montar o ultraplan local.', {
      display: 'system',
      nextInput: buildDeepPlanPrompt(description),
      submitNextInput: true
    });
    return null;
  }

  if (currentMode !== 'plan') {
    handlePlanModeTransition(currentMode, 'plan');
    setAppState(prev => ({
      ...prev,
      toolPermissionContext: applyPermissionUpdate(prepareContextForPlanMode(prev.toolPermissionContext), {
        type: 'setMode',
        mode: 'plan',
        destination: 'session'
      })
    }));
    const description = trimmedArgs;
    if (description) {
      onDone('Plan mode ligado.', {
        shouldQuery: true
      });
    } else {
      onDone('Plan mode ligado.', {
        display: 'system'
      });
    }
    return null;
  }

  const planContent = getPlan();
  const planPath = getPlanFilePath();
  if (!planContent) {
    onDone('Já está em plan mode, mas ainda não existe plano salvo nesta sessão.', {
      display: 'system'
    });
    return null;
  }

  const editor = getExternalEditor();
  const editorName = editor ? toIDEDisplayName(editor) : undefined;
  const display = <PlanDisplay planContent={planContent} planPath={planPath} editorName={editorName} />;
  const output = await renderToString(display);
  onDone(output, {
    display: 'system'
  });
  return null;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsImhhbmRsZVBsYW5Nb2RlVHJhbnNpdGlvbiIsIkxvY2FsSlNYQ29tbWFuZENvbnRleHQiLCJCb3giLCJUZXh0IiwiTG9jYWxKU1hDb21tYW5kT25Eb25lIiwiZ2V0RXh0ZXJuYWxFZGl0b3IiLCJnZXRGc0ltcGxlbWVudGF0aW9uIiwidG9JREVEaXNwbGF5TmFtZSIsImFwcGx5UGVybWlzc2lvblVwZGF0ZSIsInByZXBhcmVDb250ZXh0Rm9yUGxhbk1vZGUiLCJnZXRQbGFuIiwiZ2V0UGxhbkZpbGVQYXRoIiwiZ2V0UGxhbnNEaXJlY3RvcnkiLCJlZGl0RmlsZUluRWRpdG9yIiwicmVuZGVyVG9TdHJpbmciLCJQbGFuRGlzcGxheSIsInQwIiwiJCIsIl9jIiwicGxhbkNvbnRlbnQiLCJwbGFuUGF0aCIsImVkaXRvck5hbWUiLCJ0MSIsIlN5bWJvbCIsImZvciIsInQyIiwidDMiLCJ0NCIsInQ1IiwiYnVpbGREZWVwUGxhblByb21wdCIsImRlc2NyaXB0aW9uIiwiam9pbiIsImxpc3RQbGFuRmlsZXMiLCJmcyIsImRpciIsImV4aXN0c1N5bmMiLCJyZWFkaXJTdHJpbmdTeW5jIiwiZmlsdGVyIiwibmFtZSIsImVuZHNXaXRoIiwic29ydCIsInJlc29sdmVSZXF1ZXN0ZWRQbGFuUGF0aCIsInNsdWciLCJub3JtYWxpemVkIiwiZnVsbCIsInJlcGxhY2UiLCJjYWxsIiwib25Eb25lIiwiY29udGV4dCIsImFyZ3MiLCJQcm9taXNlIiwiUmVhY3ROb2RlIiwiZ2V0QXBwU3RhdGUiLCJzZXRBcHBTdGF0ZSIsImFwcFN0YXRlIiwiY3VycmVudE1vZGUiLCJ0b29sUGVybWlzc2lvbkNvbnRleHQiLCJtb2RlIiwidHJpbW1lZEFyZ3MiLCJ0cmltIiwiYXJnTGlzdCIsInNwbGl0IiwicHJpbWFyeUFyZyIsInRvTG93ZXJDYXNlIiwiZmlsZXMiLCJkaXNwbGF5IiwicmVzdWx0IiwicmVzdWx0LmVycm9yIiwicmVxdWVzdGVkU2x1ZyIsInNsaWNlIiwidW5kZWZp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