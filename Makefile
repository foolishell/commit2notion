.PHPNY: init up down restart

init:
	docker-compose build --no-cache
	docker-compose up -d
up:
	docker-compose up -d
down:
	docker-compose down --remove-orphans
restart:
	@make down
	@make up
ps:
	docker-compose ps

shell:
	docker-compose up -d shell
	docker-compose exec shell bash
ts-build:
	docker-compose exec shell yarn build
