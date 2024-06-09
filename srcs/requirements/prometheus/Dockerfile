FROM alpine:3.20.0

#Docker file from https://github.com/badtuxx/prometheus_alpine/blob/master/Dockerfile
#Because the freaking prometheus official image is build on a stupid custom distro without everything usefull
LABEL maintainer="jeferson@linuxtips.com.br"

ENV prometheus_version 2.52.0

RUN adduser -s /bin/false -D -H prometheus \
    && adduser -s /bin/false -D -H node_exporter \
    && apk update \
    && apk --no-cache add curl \
    && curl -LO https://github.com/prometheus/prometheus/releases/download/v${prometheus_version}/prometheus-${prometheus_version}.linux-amd64.tar.gz \
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
    && chown prometheus:prometheus /var/lib/prometheus \
    && apk del curl

VOLUME /etc/prometheus

VOLUME /var/lib/prometheus

ENTRYPOINT /usr/local/bin/prometheus \ 
            --config.file /etc/prometheus/prometheus.yml \ 
            --storage.tsdb.path /prometheus \
            --web.console.libraries=/usr/share/prometheus/console_libraries \
            --web.console.templates=/usr/share/prometheus/consoles \
			--web.config.file=/etc/prometheus/web-config.yml \
			--web.external-url=/adm/prometheus
# From this its home made ##################################################################

LABEL		author="ggualerz@student.42nice.fr"

# Copy Prometheus configuration file
ADD prometheus.yml /etc/prometheus/
ADD web-config.yml /etc/prometheus/

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

RUN chmod -R 744 /ssl
EXPOSE 9090

#Token backend :)))))))))

COPY token_backend /etc/prometheus/token_backend