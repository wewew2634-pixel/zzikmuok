up:
	docker compose -f docker-compose.prod.yml up -d --build

logs:
	docker compose -f docker-compose.prod.yml logs -f

down:
	docker compose -f docker-compose.prod.yml down

restart:
	docker compose -f docker-compose.prod.yml restart

health:
	curl -I https://$(DOMAIN_APP) ; \
	curl -u zzik:$$BASIC_AUTH_PASS -s https://$(DOMAIN_MCP) \
	  -H "Content-Type: application/json" \
	  -d '{"jsonrpc":"2.0","id":1,"method":"health"}'
