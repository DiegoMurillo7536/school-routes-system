BACKEND_TEST ?= .venv/bin/python -m pytest
FRONTEND_TEST ?= npm test

.PHONY: test
test:
	@status=0; \
	(cd backend && $(BACKEND_TEST)) || status=1; \
	(cd frontend && $(FRONTEND_TEST)) || status=1; \
	exit $$status
