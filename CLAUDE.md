This is a zero-dependency JS grid library.

Never introduce non-dev dependencies.

When fixing bugs:
1. Try to add a failing test first to validate the bug - unit, integration, or e2e. Unit testing preferred whenever possible.
2. Use mocks minimally, so we can recreate bug behavior as close to a real environment as possible.
3. This library is very modular, pay attention to unintended consequences of a change across modules.
4. When writing a PR for a bug issue - make sure to have the syntax "Fix #bugid" included in the PR description so that GitHub will auto-close the issue.
5. Add a small comment to tests that fix specific issues with a link to the issue with a 1-sentence note. eg:
  ```
   // Fix https://github.com/xyz/abc/issues/1
   // Date times not formatting correctly
  ```


Testing approach:
1. Test as much as possible with unit tests
2. e2e tests can be used for UI bugs, be conservative and careful with these as e2e tests can become flaky.
3. If you really can't test something, that's fine, just make a note of it.
4. Minimal mocking
5. Follow test folder and structure conventions.

Architecture:

Tabulator's core code is fairly small by design, most functionality is added by modules. We should follow this convention.
Modules can interact with each other, so always consider the effect of a module change on other modules.
