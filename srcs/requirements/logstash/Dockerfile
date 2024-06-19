FROM		logstash:8.14.1

LABEL		author="ggualerz@student.42nice.fr"

USER 0
# Install CA certificates package
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

# Copy your custom CA
COPY CA.crt /usr/local/share/ca-certificates/CA.crt

# Update the certificate store
RUN update-ca-certificates


#Add my keys
RUN mkdir /ssl
COPY *.crt /ssl/
COPY *.key /ssl/

COPY logstash.yml /usr/share/logstash/config/logstash.yml
COPY inited_logstash.conf /usr/share/logstash/pipeline/logstash.conf

RUN chown 1000 /usr/share/logstash/config/logstash.yml
RUN chown 1000 /usr/share/logstash/pipeline/logstash.conf
RUN chown -R 1000 /ssl

USER 1000