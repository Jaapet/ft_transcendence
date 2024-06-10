# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: thepaqui <thepaqui@student.42nice.fr>      +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/05/05 17:20:04 by thepaqui          #+#    #+#              #
#    Updated: 2024/05/05 18:32:45 by thepaqui         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		python:3.8-alpine

LABEL		author="thepaqui@student.42nice.fr"

##CA & Cert######################
# Install CA certificates package
RUN apk update && apk add ca-certificates && update-ca-certificates

# Copy your custom CA
COPY CA.crt /usr/local/share/ca-certificates/CA.crt

# Update the certificate store
RUN update-ca-certificates

# Add srv cert
RUN mkdir /ssl
COPY *.crt /ssl/
COPY *.key /ssl/
#################################

ENV			PIP_DISABLE_PIP_VERSION_CHECK 1

ENV			PYTHONDONTWRITEBYTECODE 1

ENV			PYTHONUNBUFFERED 1

#COPY		conf/backend /usr/app

WORKDIR		/usr/app

RUN			apk add --no-cache \
				build-base \
				libpq-dev \
			&& \
			pip install --upgrade \
				pip \
			&& \
			pip install --no-cache-dir \
				django \
				djangorestframework \
				djangorestframework_simplejwt \
				django-cors-headers \
				psycopg2 \
				pillow
#				django-sslserver

# psycopg2 if for postgres
# pillow is required for ImageField to work

COPY		conf/start.sh ../

EXPOSE		8000

ENTRYPOINT	["sh", "../start.sh"]
