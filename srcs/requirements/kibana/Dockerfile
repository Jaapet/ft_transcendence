FROM		kibana:8.14.1

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

COPY kibana.yml /usr/share/kibana/config/kibana.yml

RUN chown 1000 /usr/share/kibana/config/kibana.yml
RUN chown -R 1000 /ssl

COPY start.sh /usr/share/kibana/start.sh
RUN chmod +x /usr/share/kibana/start.sh
RUN chown 1000 /usr/share/kibana/start.sh

USER 1000

ENTRYPOINT ["tail","-f","/dev/null"]
# ENTRYPOINT ["/usr/share/kibana/start.sh"]