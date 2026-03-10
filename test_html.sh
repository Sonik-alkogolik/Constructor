#!/bin/bash
# Тест HTML для Visual Readactor
# Запускает curl к localhost:3000 и сохраняет ответ в test_html.log

echo "Waiting for server to start..."
sleep 5

echo "Making request to http://localhost:3000/..."
curl -s http://localhost:3000/ > test_html.log

echo "Done! Response saved to test_html.log"
echo "Checking response..."
cat test_html.log
