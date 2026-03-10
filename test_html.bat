@echo off
REM Тест HTML для Visual Readactor
REM Запускает curl к localhost:3000 и сохраняет ответ в test_html.log

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Making request to http://localhost:3000/...
curl -s http://localhost:3000/ > test_html.log

echo Done! Response saved to test_html.log
echo Checking response...
type test_html.log
