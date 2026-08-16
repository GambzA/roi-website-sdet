/* ═══════════════════════════════════════════════════════════════════════════
   Step reporter — emits one @@STEP line per Playwright step so the local
   runner can route them to the UI and highlight the line being executed.

   Runs alongside the `list` reporter; @@STEP is the only prefix the runner
   pulls out of stdout, everything else stays console output.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Fixture and hook steps are plumbing — only the calls written in the spec
   are worth showing. */
const SHOWN = new Set(['test.step', 'expect', 'pw:api']);

class StepReporter {
  onStepBegin(test, result, step) { this._emit('begin', step); }
  onStepEnd(test, result, step)   { this._emit('end', step); }

  _emit(phase, step) {
    if (!SHOWN.has(step.category) || !step.location) return;
    process.stdout.write('@@STEP' + JSON.stringify({
      phase,
      title:    step.title,
      category: step.category,
      file:     step.location.file,
      line:     step.location.line,
      error:    step.error ? String(step.error.message || step.error).split('\n')[0] : null,
    }) + '\n');
  }
}

module.exports = StepReporter;
