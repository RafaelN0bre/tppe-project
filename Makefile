.DEFAULT_GOAL := help

OS := $(shell (uv run python -c "import platform; print(platform.system().lower())" 2>/dev/null))

ifeq ($(OS), windows)
	PYTHONPATH := set PYTHONPATH=.
else
	PYTHONPATH := export PYTHONPATH=.
endif

help:
	@echo Usage:
	@echo   make dev                      - Run application in development mode with auto-reload
	@echo	make start					  - Run application in production mode
	@echo   make test                     - Run tests using pytest
	@echo   make test-debug               - Run tests with debug flags verbose and interactive
	@echo   make test-cov                 - Run tests with coverage evaluation
	@echo   make test-show                - Run tests and display setup details
	@echo   make ruff                     - Run Ruff to check code for linting errors

dev:
	uv run uvicorn api.__main__:app --host 0.0.0.0 --port 8081 --reload
	open http://localhost:8080/api/docs

start:
	uv run uvicorn api.__main__:app --host 0.0.0.0 --port 8081

test:
	$(PYTHONPATH) && time uv run pytest $(or $(TEST_PATH),)

test-cov:
	$(PYTHONPATH) && uv run pytest --cov=. --cov-report=term --cov-report=html --cov-config=.coveragerc
	open ./htmlcov/index.html

test-debug:
	$(PYTHONPATH) && uv run pytest -s -v $(or $(TEST_PATH),)

test-show:
	$(PYTHONPATH) && uv run pytest -v --setup-show  $(or $(TEST_PATH),)

ruff:
	uv run ruff check