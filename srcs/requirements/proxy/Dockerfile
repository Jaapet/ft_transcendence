#ggualerz header

FROM		traefik:v3.0.1

LABEL		author="ggualerz@student.42nice.fr"

# Install CA certificates package
RUN apk update && apk add ca-certificates && update-ca-certificates

# Copy your custom CA
COPY CA.crt /usr/local/share/ca-certificates/CA.crt
COPY transcendence.gmcg.fr.crt /usr/local/share/ca-certificates/transcendence.gmcg.fr.crt
COPY localhost.crt /usr/local/share/ca-certificates/localhost.crt

# Update the certificate store
RUN update-ca-certificates

#Add my keys
RUN mkdir /ssl


COPY *.crt /ssl/
COPY *.key /ssl/

#ssl dyn conf of traefik
COPY ssl.yml /app/ssl.yml