FROM		elasticsearch:8.14.1

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

COPY elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
RUN chmod -R 644 /usr/share/elasticsearch/config/elasticsearch.yml
RUN chown 1000 /usr/share/elasticsearch/config/elasticsearch.yml
RUN chmod -R 644 /ssl
RUN chown -R 1000 /ssl

#FOR ELASTIC CERTS, HANDLE SOME ISSUES, because /ssl cannot be read for some elastic magic reason (related to official immage)
COPY *.crt /usr/share/elasticsearch/config
COPY *.key /usr/share/elasticsearch/config
RUN chmod -R 644 /usr/share/elasticsearch/config/*.crt
RUN chmod -R 644 /usr/share/elasticsearch/config/*.key


# COPY start.sh /usr/share/elasticsearch/start.sh
# RUN chmod +x /usr/share/elasticsearch/start.sh
# RUN chown 1000 /usr/share/elasticsearch/start.sh

USER 1000


# ENTRYPOINT ["tail","-f","/dev/null"]
# ENTRYPOINT ["/usr/share/elasticsearch/start.sh"]