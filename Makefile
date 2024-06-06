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

all:
	@./srcs/requirements/CAandCertGeneration.sh
	@echo "Building the services and starting them in background"
	@cd srcs && docker compose build && docker compose -p ${PROJECT_NAME} up -d

f:
	@./srcs/requirements/CAandCertGeneration.sh
	@echo "Building the services and starting them in foreground"
	@cd srcs && docker compose build && docker compose -p ${PROJECT_NAME} up

clean:
	@echo "Stopping services and their network, keeping volumes and images"
	@cd srcs && docker compose -p ${PROJECT_NAME} down

rmcert:
	@./srcs/requirements/CAandCertDeletion.sh

# TODO: Make this only remove images associated with ${PROJECT_NAME}
fclean:
	@./srcs/requirements/CAandCertDeletion.sh
	@echo "Stopping services and their network, deleting volumes and images"
	@cd srcs && docker compose -p ${PROJECT_NAME} down -v
	@docker system prune --all

re: clean all

fre: clean f

reset: fclean all

freset: fclean f
