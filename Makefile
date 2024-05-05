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

# Includes ./srcs/.env like include in C/C++
include ./srcs/.env
# Exports all variables to current context's env
# This includes what was included from ./srcs/.env
export

.PHONY: all clean fclean re

all:
#	@echo "Adding thepaqui.42.fr to known domain names,"
#	@echo "resolving it to local host (127.0.0.1)"
#	Making our domain name resolve to localhost
#	THIS NEXT LINE MIGHT BE USELESS
#	@sudo chmod 666 /etc/hosts
#	@sudo echo "127.0.0.1 $(FQDN)" >> /etc/hosts
#	@sudo echo "127.0.0.1 www.$(FQDN)" >> /etc/hosts

	@echo "Building the services and starting them"
	@mkdir -p /home/thepaqui/data -m 777
#	docker compose build -> builds images (rebuilds if Dockerfile changed)
#	docker compose up -d -> builds, creates, starts and attaches
#	containers for services. Starts them in background thanks to -d
	@cd srcs && docker compose build && docker compose up -d
#	TODO: Might need to remove the -d?

clean:
	@echo "Stopping services and their network, keeping volumes"
#	docker compose down -> stops containers and removes containers, networks,
#	volumes and images created by up but doesn't delete persistent data
	@cd srcs && docker compose down

fclean:
	@echo "Stopping services and their network, deleting volumes"
#	docker compose down -> stops containers and removes containers, networks,
#	volumes and images created by up and deletes persistent data
	@cd srcs && docker compose down -v
	@docker system prune --all

re: fclean all