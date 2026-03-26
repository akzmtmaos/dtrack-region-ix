@echo off
cd /d "%~dp0"
set PHP_EXE=C:\xampp\php\php.exe
if not exist "%PHP_EXE%" (
  echo Edit serve-laravel.bat: set PHP_EXE= to your php.exe path
  pause
  exit /b 1
)
"%PHP_EXE%" artisan serve --host=127.0.0.1 --port=8000
