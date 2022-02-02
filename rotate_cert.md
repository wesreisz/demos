#rotate certs on harbor

docker-compose down
sudo docker-compose down
sudo certbot renew
./prepare --with-notary --with-clair --with-chartmuseum
 sudo docker-compose up -d
openssl s_client -servername harbor.wesleyreisz.com -connect harbor.wesleyreisz.com:443 2>/dev/null | openssl x509 -noout -dates
