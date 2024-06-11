FROM bitnami/postgres-exporter:0.15.0
LABEL		author="ggualerz@student.42nice.fr"

USER 0

# Install CA certificates package
RUN apt-get update && apt-get install -y ca-certificates

# Copy your custom CA
COPY CA.crt /usr/local/share/ca-certificates/CA.crt

# Update the certificate store
RUN update-ca-certificates

# SSL
# Add my keys
RUN mkdir /ssl
COPY *.crt /ssl/
COPY *.key /ssl/

#TODO CHANGER CA
ENV DATA_SOURCE_NAME "postgresql://rachid:jadorelargent@db:5432/transcendence"
COPY postgres_exporter.yml postgres_exporter.yml

#TODO TLS SUPPORT
#https://github.com/prometheus/exporter-toolkit/blob/master/docs/web-configuration.md
#https://github.com/prometheus-community/postgres_exporter#flags