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
RUN chown -R 1001 /ssl

COPY inited_postgres_exporter.yml postgres_exporter.yml

USER 1001
COPY web-config.yml /opt/bitnami/postgres-exporter/
ENTRYPOINT ["postgres_exporter", "--web.config.file=/opt/bitnami/postgres-exporter/web-config.yml"]
#TODO TLS SUPPORT
#https://github.com/prometheus/exporter-toolkit/blob/master/docs/web-configuration.md
#https://github.com/prometheus-community/postgres_exporter#flags
