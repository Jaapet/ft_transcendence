#!/bin/bash

# Environment variables for passwords
KEYSTORE_PASSWORD=${ELASTIC_KEYSTORE_PASSWORD}
TRUSTSTORE_PASSWORD=${ELASTIC_TRUSTSTORE_PASSWORD}

# File paths
PRIVATE_KEY="/usr/share/elasticsearch/config/elasticsearch.key"
PRIVATE_KEY_PKCS12="/usr/share/elasticsearch/config/elasticsearch.p12"
PRIVATE_KEY_PKCS12_PASSWD=${KEYSTORE_PASSWORD}

CERTIFICATE="/usr/share/elasticsearch/config/elasticsearch.crt"
CERTIFICATE_DER="/usr/share/elasticsearch/config/elasticsearch.der.crt"

CA_CERT="/usr/share/elasticsearch/config/CA.crt"
CA_CERT_DER="/usr/share/elasticsearch/config/CA.der.crt"
KEYSTORE="/usr/share/elasticsearch/data/keystore.p12"
TRUSTSTORE="/usr/share/elasticsearch/data/truststore.p12"

# Check if keystore already exists
if [ -f "$KEYSTORE" ]; then
  echo "Keystore already exists at $KEYSTORE. Skipping creation."
else
  echo "Creating keystore..."
  # Convert PEM key to PKCS12
  openssl x509 -outform der -in $CERTIFICATE -out $CERTIFICATE_DER
  openssl pkcs12 -export -in $CERTIFICATE -inkey $PRIVATE_KEY -out $PRIVATE_KEY_PKCS12 -passout pass:"$PRIVATE_KEY_PKCS12_PASSWD"
  openssl x509 -outform der -in $CA_CERT -out $CA_CERT_DER

  # Import private key and certificate into keystore
  keytool -importkeystore -srcstorepass "$PRIVATE_KEY_PKCS12_PASSWD" -srckeystore "$PRIVATE_KEY_PKCS12" -destkeystore "$KEYSTORE" -deststorepass "$KEYSTORE_PASSWORD" -destkeypass "$KEYSTORE_PASSWORD" -alias elasticsearch -noprompt
#   keytool -importcert -file "$CERTIFICATE_DER" -alias elasticsearch -keystore "$KEYSTORE" -storepass "$KEYSTORE_PASSWORD" -noprompt

  
  if [ $? -eq 0 ]; then
    echo "Keystore created successfully at $KEYSTORE."
  else
    echo "Failed to create keystore."
    exit 1
  fi
fi

# Check if truststore already exists
if [ -f "$TRUSTSTORE" ]; then
  echo "Truststore already exists at $TRUSTSTORE. Skipping creation."
else
  echo "Creating truststore..."
  openssl x509 -outform der -in $CA_CERT -out $CA_CERT_DER
  keytool -import -trustcacerts -alias ca-cert -file "$CA_CERT_DER" -keystore "$TRUSTSTORE" -storepass "$TRUSTSTORE_PASSWORD" -noprompt

  if [ $? -eq 0 ]; then
    echo "Truststore created successfully at $TRUSTSTORE."
  else
    echo "Failed to create truststore."
    exit 1
  fi
fi

echo "Script completed successfully."


# Run Elasticsearch Docker entrypoint or start Elasticsearch service
# /bin/bash -- /usr/local/bin/docker-entrypoint.sh
# tail -f /dev/null