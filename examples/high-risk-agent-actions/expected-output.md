# Expected output

The demo should print one line per scenario and create a Markdown report. Expected decisions:

| Scenario | Expected decision |
|---|---|
| AI tries to delete protected folder | needs_approval or deny |
| AI tries to run shell command | deny |
| AI tries to mutate database | needs_approval |
| AI tries to call dangerous MCP tool | deny |
| AI tries to send external email-like action | needs_approval |
| AI uses poisoned retrieved context | deny |
| AI installs risky skill/plugin | deny |
