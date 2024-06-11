FROM alpine:3.20.0
#
LABEL author="ggualerz@student.42nice.fr"
# Docker file from https://github.com/badtuxx/prometheus_alpine/blob/master/Dockerfile, it was modified for alert manager and other things
# Because the freaking prometheus official image is build on a stupid custom distro without everything useful

ENV prometheus_version 2.52.0
ENV alertmanager_version 0.27.0

RUN adduser -s /bin/false -D -H prometheus \
    && adduser -s /bin/false -D -H node_exporter \
    && adduser -s /bin/false -D -H alertmanager \
    && apk update \
    && apk --no-cache add curl

# Download and setup Prometheus
RUN curl -LO https://github.com/prometheus/prometheus/releases/download/v${prometheus_version}/prometheus-${prometheus_version}.linux-amd64.tar.gz \
    && tar -xvzf prometheus-${prometheus_version}.linux-amd64.tar.gz \
    && mkdir -p /etc/prometheus /var/lib/prometheus \
    && cp prometheus-${prometheus_version}.linux-amd64/promtool /usr/local/bin/ \
    && cp prometheus-${prometheus_version}.linux-amd64/prometheus /usr/local/bin/ \
    && cp -R prometheus-${prometheus_version}.linux-amd64/console_libraries/ /etc/prometheus/ \
    && cp -R prometheus-${prometheus_version}.linux-amd64/consoles/ /etc/prometheus/ \
    && rm -rf prometheus-${prometheus_version}.linux-amd64* \
    && chown prometheus:prometheus /usr/local/bin/prometheus \
    && chown prometheus:prometheus /usr/local/bin/promtool \
    && chown -R prometheus:prometheus /etc/prometheus \
    && chown prometheus:prometheus /var/lib/prometheus

# Download and setup Alertmanager
RUN curl -LO https://github.com/prometheus/alertmanager/releases/download/v${alertmanager_version}/alertmanager-${alertmanager_version}.linux-amd64.tar.gz \
    && tar -xvzf alertmanager-${alertmanager_version}.linux-amd64.tar.gz \
    && mkdir -p /etc/alertmanager /var/lib/alertmanager \
    && cp alertmanager-${alertmanager_version}.linux-amd64/alertmanager /usr/local/bin/ \
    && cp alertmanager-${alertmanager_version}.linux-amd64/amtool /usr/local/bin/ \
    && cp -R alertmanager-${alertmanager_version}.linux-amd64/alertmanager.yml /etc/alertmanager/ \
    && rm -rf alertmanager-${alertmanager_version}.linux-amd64* \
    && chown alertmanager:alertmanager /usr/local/bin/alertmanager \
    && chown alertmanager:alertmanager /usr/local/bin/amtool \
    && chown -R alertmanager:alertmanager /etc/alertmanager \
    && chown alertmanager:alertmanager /var/lib/alertmanager \
    && apk del curl

VOLUME /etc/prometheus
VOLUME /var/lib/prometheus
VOLUME /etc/alertmanager
VOLUME /var/lib/alertmanager

ENTRYPOINT ["/bin/sh", "-c", "prometheus --config.file=/etc/prometheus/prometheus.yml --storage.tsdb.path=/prometheus --web.console.libraries=/usr/share/prometheus/console_libraries --web.console.templates=/usr/share/prometheus/consoles --web.config.file=/etc/prometheus/web-config.yml --web.external-url=/adm/prometheus & alertmanager --config.file=/etc/alertmanager/alertmanager.yml"]

# Copy Prometheus and Alertmanager configuration files
COPY prometheus.yml /etc/prometheus/
COPY web-config.yml /etc/prometheus/
COPY alerts-rules.yml /etc/prometheus/
COPY inited_alertmanager.yml /etc/alertmanager/alertmanager.yml

COPY webhook.secret /etc/alertmanager/
RUN chmod -R 755 /etc/alertmanager
# Install CA certificates package
RUN apk update && apk add ca-certificates && update-ca-certificates

# Copy your custom CA
COPY CA.crt /usr/local/share/ca-certificates/CA.crt

# Update the certificate store
RUN update-ca-certificates

# Add SSL certificates
RUN mkdir /ssl
COPY *.crt /ssl/
COPY *.key /ssl/
RUN chmod -R 744 /ssl
COPY token_backend /etc/prometheus/token_backend

EXPOSE 9090
EXPOSE 9093
