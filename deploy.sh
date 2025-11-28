PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "REACT_APP_API_URL=http://$PUBLIC_IP:8089" > .env
