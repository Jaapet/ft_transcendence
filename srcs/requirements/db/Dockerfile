#ggualerz header

FROM		postgres:14.11

LABEL		author="thepaqui@student.42nice.fr"

# Install CA certificates package
RUN apt-get update && apt-get install -y ca-certificates

# Copy your custom CA
COPY CA.crt /usr/local/share/ca-certificates/CA.crt

# Update the certificate store
RUN update-ca-certificates

#Add my keys
RUN mkdir /ssl
COPY *.crt /ssl/
COPY *.key /ssl/
RUN chmod 400 /ssl/* && chown postgres:postgres /ssl/*
#Force Postgresql in ssl
RUN echo "hostssl all all all scram-sha-256" > /var/lib/postgresql/data/pg_hba.conf