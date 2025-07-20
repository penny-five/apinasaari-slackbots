#!/bin/bash

set -e

echo "Stopping services..."
sudo systemctl stop n8n.service caddy.service

echo "Fetching latest code..."
(cd /opt/apinasaari-slackbots && git switch main && git pull)

echo "Restarting services..."
sudo systemctl restart caddy.service n8n.service

echo "Update completed!"
