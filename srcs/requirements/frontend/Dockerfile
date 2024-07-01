# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: thepaqui <thepaqui@student.42nice.fr>      +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/05/06 17:51:04 by thepaqui          #+#    #+#              #
#    Updated: 2024/05/05 18:32:45 by thepaqui         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		node:20-alpine

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

RUN chmod -R 777 /ssl

ENV NODE_EXTRA_CA_CERTS /ssl/CA.crt

#################################

WORKDIR		/app

RUN			apk add --no-cache libc6-compat

COPY		conf/start.sh ./

# ENV NODE_EXTRA_CA_CERTS=/ssl/CA.crt

EXPOSE		3000
EXPOSE		3001
ENTRYPOINT	["sh", "start.sh"]

