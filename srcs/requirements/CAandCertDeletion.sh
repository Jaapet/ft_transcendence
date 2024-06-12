#!/bin/bash
#If thoses env var are not set (for debug purpose)
: ${REQUIREMENTS_DIR:=./srcs/requirements}
: ${PROJECT_NAME:=proxy}
: ${FQDN:=transcendence.gmcg.fr}

# Exit on error
set -e

#RM the lock
if [ -f ".ssl_is_gen" ]; then
    # If the file exists, exit with status code 0
	rm .ssl_is_gen
fi

# Validate that the provided argument is a directory
if [ ! -d "${REQUIREMENTS_DIR}" ]; then
    echo "Error: ${REQUIREMENTS_DIR} is not a directory."
    exit 1
fi

# Remove CA files if they exist
CA_KEY="CA.key"
CA_CERT="CA.crt"
CA_SERIAL="CA.srl"

if [ -f "${CA_KEY}" ]; then
    rm "${CA_KEY}"
    echo "Deleted ${CA_KEY}"
fi

if [ -f "${CA_CERT}" ]; then
    rm "${CA_CERT}"
    echo "Deleted ${CA_CERT}"
fi

if [ -f "${CA_SERIAL}" ]; then
    rm "${CA_SERIAL}"
    echo "Deleted ${CA_SERIAL}"
fi

# Loop through each folder in the target directory
for folder in "${REQUIREMENTS_DIR}"/*/; do
    folder_name=$(basename "${folder}")

	if [ "$folder_name" == "proxy" ]; then
		#FOR DEV ENVIRONMENT PURPOSE
		FOLDER_KEY_TEMP="${REQUIREMENTS_DIR}/${folder_name}/${FQDN}.key"
    	FOLDER_CRT_TEMP="${REQUIREMENTS_DIR}/${folder_name}/${FQDN}.crt"
    	FOLDER_CSR_TEMP="${REQUIREMENTS_DIR}/${folder_name}/${FQDN}.csr"

		if [ -f "${FOLDER_KEY_TEMP}" ]; then
    	    rm "${FOLDER_KEY_TEMP}"
    	    echo "Deleted ${FOLDER_KEY_TEMP}"
    	fi
    	if [ -f "${FOLDER_CRT_TEMP}" ]; then
    	    rm "${FOLDER_CRT_TEMP}"
    	    echo "Deleted ${FOLDER_CRT_TEMP}"
    	fi
    	if [ -f "${FOLDER_CSR_TEMP}" ]; then
    	    rm "${FOLDER_CSR_TEMP}"
    	    echo "Deleted ${FOLDER_CSR_TEMP}"
    	fi
	fi

    # Define the file patterns to be deleted
    FOLDER_KEY="${REQUIREMENTS_DIR}/${folder_name}/${folder_name}.key"
    FOLDER_CRT="${REQUIREMENTS_DIR}/${folder_name}/${folder_name}.crt"
    FOLDER_CSR="${REQUIREMENTS_DIR}/${folder_name}/${folder_name}.csr"
	FOLDER_CA_CERT="${REQUIREMENTS_DIR}/${folder_name}/CA.crt"
    if [ -f "${FOLDER_KEY}" ]; then
        rm "${FOLDER_KEY}"
        echo "Deleted ${FOLDER_KEY}"
    fi
    if [ -f "${FOLDER_CRT}" ]; then
        rm "${FOLDER_CRT}"
        echo "Deleted ${FOLDER_CRT}"
    fi
    if [ -f "${FOLDER_CSR}" ]; then
        rm "${FOLDER_CSR}"
        echo "Deleted ${FOLDER_CSR}"
    fi
	if [ -f "${FOLDER_CA_CERT}" ]; then
        rm "${FOLDER_CA_CERT}"
        echo "Deleted ${FOLDER_CA_CERT}"
    fi
done

echo "All specified files have been deleted."
