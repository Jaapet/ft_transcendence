# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: thepaqui <thepaqui@student.42nice.fr>      +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/05/05 17:13:04 by thepaqui          #+#    #+#              #
#    Updated: 2024/05/05 18:12:21 by thepaqui         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

include ./srcs/.env
export

.PHONY: all f clean fclean re fre reset freset

# TODO: Need to launch this in rootless mode :(

all: #TODO TOKEN MESKOUILLES voir greg
	@echo "${METRICS_TOKEN_BACKEND}" >> ${REQUIREMENTS_DIR}/prometheus/token_backend 
	@./srcs/requirements/CAandCertGeneration.sh
	@echo "Building the services and starting them in background"
	@cd srcs && docker compose build && docker compose  --project-name ${PROJECT_NAME} ${PROFILES_COMPOSE} up -d

f:
	@echo "${METRICS_TOKEN_BACKEND}" >> ${REQUIREMENTS_DIR}/prometheus/token_backend
	@./srcs/requirements/CAandCertGeneration.sh
	@echo "Building the services and starting them in foreground"
	@cd srcs && docker compose build && docker compose --project-name ${PROJECT_NAME} ${PROFILES_COMPOSE} up

clean:
	@rm ${REQUIREMENTS_DIR}/prometheus/token_backend
	@echo "Stopping services and their network, keeping volumes and images"
	@cd srcs && docker compose --project-name ${PROJECT_NAME} ${PROFILES_COMPOSE} down

rmcert:
	@./srcs/requirements/CAandCertDeletion.sh

# TODO: Make this only remove images associated with ${PROJECT_NAME}
fclean:
	@rm ${REQUIREMENTS_DIR}/prometheus/token_backend
	@./srcs/requirements/CAandCertDeletion.sh
	@echo "Stopping services and their network, deleting volumes and images"
	@cd srcs && docker compose --project-name ${PROJECT_NAME} ${PROFILES_COMPOSE} down -v
	@docker system prune --all

re: clean all

fre: clean f

reset: fclean all

freset: fclean f
