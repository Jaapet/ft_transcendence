# SSL

What is this mess ?
It contain everything to make the ssl for user and ssl between containers working
It has its own CA, and each service have a cert signed by this CA

## What is a CA

A CA is a Certification Authority, our containers will all trust this CA to accept without error the services certs

Yes DON'T DELETE CA.pem and CA.key or ggualerz will kick your ass and ban you from the dev server

## Content
Here all the files related to the: 

- CA cert and its private key (should no be send to containers)

- Container cert and there related private key (db will be db.cert & db.key)

- Proxy container will receive the "localhost.crt and its key", why ? because its hostname will be this during the submiting.

- While in dev process, proxy container will receive the transcendence.gmcg.fr.cert and its .key

## How to gen my own certificate

Your service container name will be for example "frontend"

### Cnf conf example

Create a frontend.cnf like :
[req]
default_bits = 2048
prompt = no
default_md = sha256
req_extensions = req_ext
distinguished_name = dn

[dn]
C = FR
ST = PACA
L = Nice
O = 42Nice
OU = ThepaquiTeam
CN = frontend

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = frontend

### Then

openssl genrsa -out frontend.key 2048
openssl req -new -key frontend.key -out frontend.csr -config frontend.cnf
openssl x509 -req -in frontend.csr -CA CA.pem -CAkey CA.key -CAcreateserial -out frontend.crt -days 365 -sha256 -extfile frontend.cnf -extensions req_ext

### What to keep ?

frontend.crt and frontend.key

### How to add it to my container ?

Let's start by the CA do in the docker file this
#### Copy the crt / key / ca
All the files should be copied from this folder to your builds context (where you dockerfile is)
(frontend.key frontend.crt CA.pem)

#### Install CA certificates package
RUN apk update && apk add ca-certificates && update-ca-certificates

#### Copy your custom CA and localhost certificates to the container
COPY CA.pem /usr/local/share/ca-certificates/CA.crt
COPY frontend.crt /usr/local/share/ca-certificates/frontend.crt 

#### Update the certificate store
RUN update-ca-certificates

#### You will maybe need the .key file too
Destination may vary
COPY frontend.key /usr/local/share/ca-certificates/frontend.key


## Have a doubt ?

Ask ggualerz, just in case