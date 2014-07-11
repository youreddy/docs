REPORTER ?= list
TEST_DB=mongodb://localhost:27017/auth11-tests
TEST_NODE_ENV=test

test: node_modules
	@db=$(TEST_DB) NODE_ENV=$(TEST_NODE_ENV) \
		./node_modules/.bin/mocha --reporter $(REPORTER)

node_modules:
	@npm i

.PHONY: test
