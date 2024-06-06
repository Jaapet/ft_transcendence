#ggualerz header

FROM		postgres:16.3-alpine

LABEL		author="thepaqui@student.42nice.fr"

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
RUN chmod 400 /ssl/* && chown postgres:postgres /ssl/*

# echo "hostssl all all all scram-sha-256" > /var/lib/postgresql/data/pg_hba.conf
