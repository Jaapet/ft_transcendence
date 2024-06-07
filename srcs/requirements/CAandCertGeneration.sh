#!/bin/bash
#For using without makefile
: ${REQUIREMENTS_DIR:=./srcs/requirements}
: ${PROJECT_NAME:=proxy}
: ${FQDN:=transcendence.gmcg.fr}
# Exit on error
set -e

if [ -f ".ssl_is_gen" ]; then
    # If the file exists, exit with status code 0
    echo "Certs already generated"
    exit 0
fi

# Check if the necessary command-line tools are installed
if ! command -v openssl &> /dev/null; then
    echo "openssl could not be found. Please install it to use this script."
    exit 1
fi


CRT_TEMPLATE="/C=FR/ST=Paca/L=Nice/O=42Nice/OU=ThepaquiTeam/CN="

# Generate CA private key and certificate
CA_KEY="CA.key"
CA_CERT="CA.crt"

if [ ! -f "${CA_KEY}" ] || [ ! -f "${CA_CERT}" ]; then
    echo "Generating CA private key and certificate..."
    openssl genpkey -algorithm RSA -out "${CA_KEY}" -pkeyopt rsa_keygen_bits:2048
    openssl req -x509 -new -key "${CA_KEY}" -out "${CA_CERT}" -days 3650 -subj "${CRT_TEMPLATE}CA-Transcendence"
    echo "CA key and certificate generated."
else
    echo "CA key and certificate already exist. Skipping generation."
fi

# Validate that the provided argument is a directory
if [ ! -d "${REQUIREMENTS_DIR}" ]; then
    echo "Error: ${REQUIREMENTS_DIR} is not a directory."
    exit 1
fi

# Loop through each folder in the target directory
for folder in "${REQUIREMENTS_DIR}"/*/; do
    folder_name=$(basename "${folder}")
    if [ "$folder_name" == "proxy" ]; then
        TMP_FOLDER_KEY="${REQUIREMENTS_DIR}/${folder_name}/${FQDN}.key"
        TMP_FOLDER_CSR="${REQUIREMENTS_DIR}/${folder_name}/${FQDN}.csr"
        TMP_FOLDER_CERT="${REQUIREMENTS_DIR}/${folder_name}/${FQDN}.crt"

        echo "Generating key and certificate for ${FQDN}..."
		cat > openssl.cnf <<EOF
[req]
req_extensions = v3_req
[v3_req]
subjectAltName = @alt_names
[alt_names]
DNS.1 = ${FQDN}
EOF

        openssl genpkey -algorithm RSA -out "${TMP_FOLDER_KEY}" -pkeyopt rsa_keygen_bits:2048
        openssl req -new -key "${TMP_FOLDER_KEY}" -out "${TMP_FOLDER_CSR}" -subj "${CRT_TEMPLATE}${FQDN}" -addext "subjectAltName = DNS:${FQDN}"
        openssl x509 -req -in "${TMP_FOLDER_CSR}" -CA "${CA_CERT}" -CAkey "${CA_KEY}" -CAcreateserial -out "${TMP_FOLDER_CERT}" -days 365 -extfile openssl.cnf -extensions v3_req
    fi
    # Generate a private key for the folder
    FOLDER_KEY="${REQUIREMENTS_DIR}/${folder_name}/${folder_name}.key"
    FOLDER_CSR="${REQUIREMENTS_DIR}/${folder_name}/${folder_name}.csr"
    FOLDER_CERT="${REQUIREMENTS_DIR}/${folder_name}/${folder_name}.crt"
    echo "Generating key and certificate for ${folder_name}..."
    openssl genpkey -algorithm RSA -out "${FOLDER_KEY}" -pkeyopt rsa_keygen_bits:2048
    openssl req -new -key "${FOLDER_KEY}" -out "${FOLDER_CSR}" -subj "${CRT_TEMPLATE}${folder_name}" -addext "subjectAltName = DNS:${folder_name}"
	cat > openssl.cnf <<EOF
[req]
req_extensions = v3_req
[v3_req]
subjectAltName = @alt_names
[alt_names]
DNS.1 = ${folder_name}
EOF

    openssl x509 -req -in "${FOLDER_CSR}" -CA "${CA_CERT}" -CAkey "${CA_KEY}" -CAcreateserial -out "${FOLDER_CERT}" -days 365 -extfile openssl.cnf -extensions v3_req
    cp $CA_CERT ${REQUIREMENTS_DIR}/${folder_name}/CA.crt
    # Clean up the CSR
    echo "Certificate and key for ${folder_name} generated."
done
rm openssl.cnf
touch .ssl_is_gen
echo "All certificates and keys have been generated."
