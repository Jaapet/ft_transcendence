FROM grafana/grafana:11.0.0
LABEL		author="ggualerz@student.42nice.fr"
#Go to root
USER 0
# Install CA certificates package
RUN apk update && apk add ca-certificates && update-ca-certificates

# Copy your custom CA
COPY CA.crt /usr/local/share/ca-certificates/CA.crt

# Update the certificate store
RUN update-ca-certificates






#SSL
#Add my keys
RUN mkdir /ssl
COPY *.crt /ssl/
COPY *.key /ssl/

RUN chmod -R 700 /ssl
#Give the original user image the ownership on the certs
RUN chown -R 472 /ssl



#Go back to the original user of the image from
USER 472
#Configure Grafana, using env avoid to manipulate the conf file and make it easier to upgrade version
ENV GF_LOG_LEVEL=error
ENV GF_SERVER_SERVE_FROM_SUB_PATH=true
ENV GF_USERS_ALLOW_SIGN_UP=false
ENV GF_AUTH_DISABLE_LOGIN_FORM=true
ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
#SSL GRAFANA CONF
ENV GF_SERVER_PROTOCOL=https
ENV GF_SERVER_CERT_FILE=/ssl/grafana.crt
ENV GF_SERVER_CERT_KEY=/ssl/grafana.key
ENV GF_SECURITY_COOKIE_SECURE=true
#Provisioning
ENV GF_PATHS_PROVISIONING=/etc/grafana/provisioning


# Copy the provisioning directory into the Grafana image, this folder contain all the dashboard, sources etc
COPY provisioning /etc/grafana/provisioning
COPY dashboards /var/lib/grafana/dashboards