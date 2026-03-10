@echo off
echo Instalando todas as dependências do UNICEPLAC-POINT...
echo.

cd c:\uniceplacpoint

echo [1/6] Instalando Firebase...
call npm install firebase

echo [2/6] Instalando React e React DOM...
call npm install react react-dom

echo [3/6] Instalando ícones e bibliotecas...
call npm install lucide-react motion html5-qrcode qrcode.react

echo [4/6] Instalando dependências de desenvolvimento...
call npm install --save-dev @types/react @types/react-dom @vitejs/plugin-react tailwindcss postcss autoprefixer concurrently vite

echo [5/6] Verificando instalação...
call npm list --depth=0

echo.
echo [6/6] Instalação concluída!
echo.
echo Para iniciar o projeto:
echo   npm run dev
echo.
pause