#ggualerz header

FROM		traefik:v3.0.2

LABEL		author="ggualerz@student.42nice.fr"

# Install CA certificates package
RUN apk update && apk add ca-certificates && update-ca-certificates

# Copy your custom CA
COPY CA.crt /usr/local/share/ca-certificates/CA.crt

# Update the certificate store
RUN update-ca-certificates


#Add my keys
RUN mkdir /ssl

COPY *.crt /ssl/
COPY *.key /ssl/

#ssl dyn conf of traefik
COPY ssl.yml /app/ssl.yml
