#!/bin/bash
#Script to init a lot of config files and .env file
if [[ $1 == "clean" ]]; then
	make $1
	exit 0
fi
if [[ $1 == "fclean" ]]; then
	make $1
	exit 0
fi
# Exit immediately if any command fails
set -e
#Do the env file exist ?
ENVFILE=./srcs/.env
if [ -f "$ENVFILE" ]; then
    echo ".env $ENVFILE file found, delete it"
	rm $ENVFILE
fi

#Devops or not devops build
# Prompt the user for a yes/no choice
read -p "Do you want to use DevOps Services? (yes/no): " choice

# Check the user's choice
if [[ $choice == "yes" ]]; then
    echo "PROFILES_COMPOSE_1=--profile" >> $ENVFILE
	echo "PROFILES_COMPOSE_2=main" >> $ENVFILE
	echo "PROFILES_COMPOSE_3=--profile" >> $ENVFILE
	echo "PROFILES_COMPOSE_4=devops" >> $ENVFILE
elif [[ $choice == "no" ]]; then
        echo "PROFILES_COMPOSE_1=--profile" >> $ENVFILE
	echo "PROFILES_COMPOSE_2=main" >> $ENVFILE
	echo "PROFILES_COMPOSE_3=" >> $ENVFILE
	echo "PROFILES_COMPOSE_4=" >> $ENVFILE
else
    echo "Invalid choice. Please enter 'yes' or 'no'."
fi





#All env variable to set in the .env and to use in the templates
	#Directory Structure
	echo "REQUIREMENTS_DIR=./srcs/requirements" >> $ENVFILE
	echo "CA_DIR=./srcs/requirements" >> $ENVFILE
	#Project relative
	GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
	echo "PROJECT_NAME=${GIT_BRANCH}" >> $ENVFILE
	echo "Debug: Current branch is $GIT_BRANCH"
	if [ "$GIT_BRANCH" == "main" ]; then
    	PROJECT_PORT_ID=502
	elif [ "$GIT_BRANCH" == "proxy" ]; then
	    PROJECT_PORT_ID=501
	elif [ "$GIT_BRANCH" == "mmidon" ]; then
	    PROJECT_PORT_ID=503
	elif [ "$GIT_BRANCH" == "bebzouz" ]; then
	    PROJECT_PORT_ID=504
	elif [ "$GIT_BRANCH" == "jaapet" ]; then
	    PROJECT_PORT_ID=505
	else
	    PROJECT_PORT_ID=0
	fi
	echo "Debug: PROJECT_PORT_ID is $PROJECT_PORT_ID"
	echo "PROJECT_PORT_ID=${PROJECT_PORT_ID}" >> $ENVFILE
	FQDN=$(hostname).$(dnsdomainname)
	echo "FQDN=${FQDN}" >> $ENVFILE

	#Ports
	FRONT_PORT=${PROJECT_PORT_ID}81
	echo "FRONT_PORT=${FRONT_PORT}" >> $ENVFILE
	WEBSOCKET_PORT=${PROJECT_PORT_ID}80
	echo "WEBSOCKET_PORT=${WEBSOCKET_PORT}" >> $ENVFILE
	echo "NEXT_PUBLIC_FRONT_PORT=${FRONT_PORT}" >> $ENVFILE
	echo "NEXT_PUBLIC_WEBSOCKET_PORT=${WEBSOCKET_PORT}" >> $ENVFILE

	#Postgresql
	echo "TZ=Europe/Paris" >> $ENVFILE
	echo "POSTGRES_DB=transcendence" >> $ENVFILE
	USERNAME="rachid"
	# PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
	PASSWORD="jadorelargent"
	echo -e "\e[0;32m\n[SECRET]\tAccess to postrgesql\nUsername: ${USERNAME}\nPassword: ${PASSWORD}\n(Acccess to postgresql)\e[0m"
	echo "POSTGRES_USER=${USERNAME}" >> $ENVFILE
	echo "POSTGRES_PASSWORD=${PASSWORD}" >> $ENVFILE

	#DJANGO User Admin
	USERNAME="backchid"
	# PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
	PASSWORD=LeFricDeChristianEstrosi
	echo -e "\e[0;32m\n[SECRET]\tAdministrative access to transcendence\nUsername: ${USERNAME}\nPassword: ${PASSWORD}\n(Access to https://${FQDN}/login)\e[0m"
	echo "DJANGO_SUPERUSER_USERNAME=${USERNAME}" >> $ENVFILE
	echo "DJANGO_SUPERUSER_PASSWORD=${PASSWORD}" >> $ENVFILE
	echo "DJANGO_SUPERUSER_EMAIL=back@chid.fr" >> $ENVFILE
	#Next.js
	#TODO SETUP A LA MANO DANS LE DOCKERFILE
	echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3000" >> $ENVFILE


	#Traefik adm midleware
	USERNAME="admin"
	PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
	echo -e "\e[0;32m\n[SECRET]\tAdministrative access to devops midleware\nUsername: ${USERNAME}\nPassword: ${PASSWORD}\n(Access to https://${FQDN}/adm/*)\e[0m\n"
	HTPASSWD_OUTPUT=$(htpasswd -bn ${USERNAME} "${PASSWORD}" | sed 's/\$/\$\$/g')
	echo "ADM_PASSWD=${HTPASSWD_OUTPUT}" >> $ENVFILE
	#Grafana secrets
	echo "GF_SERVER_DOMAIN=${FQDN}" >> $ENVFILE
	echo "GF_SERVER_ROOT_URL=https://${FQDN}:${FRONT_PORT}/adm/grafana" >> $ENVFILE

	#Prometheus
	echo "PROMETHEUS_WEB_HOOK_DISCORD_URL='https://discord.com/api/webhooks/1250123017044885555/xD8TUCvv0eNTZWKigjm78aXL4htSNmYo5WxxzQaNMMeVH7-sMwMH4gQuMB5RSR-Lkf95'" >> $ENVFILE


#Source the .env file for this file and export it for the Makefile
source $ENVFILE
export $(cut -d= -f1 ./srcs/.env)

#Commands


#Template to config file

	##Prometheus AlertManager
TEMPLATE="./init_template/alertmanager.yml.template"
DEST="./srcs/requirements/prometheus/inited_alertmanager.yml"
if [ ! -f "$TEMPLATE" ]; then
    echo "Template file not found: $TEMPLATE"
    exit 1
fi
template_content=$(cat "$TEMPLATE")
expanded_content=$(envsubst <<< "$template_content")
echo "$expanded_content" > "$DEST"


#Call Makefile
make $1