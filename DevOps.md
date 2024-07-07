# DevOps

## Infra description

### Proxy

Traefik v3 is our proxy, its main purpose is to ensure a single entrypoint into the stack for the client

It handle all HTTP(80), HTTPS(443) and WebsocketHTTPS(4433). HTTP is handled only to redirect to HTTPS(443)

His main goal is to centralized all connexion, so it can serve as a reverse proxy on subpath, it can also generate metrics usefull for monitoring.

It can also handle all Let's Encrypt Challenges, sadly it cannot work when submited to evaluation.

Traefik also add midlewares to restrain access to administrative paths (/adm/*)

### PKI

The choice have been made to generate our own PKI when launching the project

All containers trust the CA

Each container have one or more cert and private key

The traffic between containers is always encrypted with those certs

### Monitoring

Monitoring containers are, Prometheus, Grafana and Postgres_Exporter

Prometheus fetch metrics from all application, infra or db related containers.
Thoses fetch are only performed in an encrypted way, throught SSL connections
Thoses metrics are used for Grafana
The Grafana legacy login was removed, the ACL and login form are handled directly by Traefik

### ELK

TODO

## Todo before submiting

Need to set a whitelist on the grafana access for validating the subject (need to be on school env)\

Remove every image tag from docker compose