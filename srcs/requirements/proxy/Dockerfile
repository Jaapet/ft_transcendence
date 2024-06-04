#ggualerz header

FROM		traefik:v3.0.1

LABEL		author="ggualerz@student.42nice.fr"

# Install CA certificates package
RUN apk update && apk add ca-certificates && update-ca-certificates

# Copy your custom CA and localhost certificates to the container
COPY CA.pem /usr/local/share/ca-certificates/CA.crt
COPY transcendence.gmcg.fr.crt /usr/local/share/ca-certificates/transcendence.gmcg.fr.crt
COPY localhost.crt /usr/local/share/ca-certificates/localhost.crt

# Update the certificate store
RUN update-ca-certificates

COPY transcendence.gmcg.fr.crt /app/transcendence.gmcg.fr.crt
COPY transcendence.gmcg.fr.key /app/transcendence.gmcg.fr.key
COPY localhost.crt /app/localhost.crt
COPY localhost.key /app/localhost.key

#ssl dyn conf of traefik
COPY ssl.yml /app/ssl.yml