@setlocal enableextensions
@echo off

echo Start job %1, complexity %2, probability to fail %3%%

set /a duration = %2 / 5
timeout /t %duration% /nobreak >nul

REM Decide success or error according to the arguments
set /a result = %2 - ^(%3 / 3^) + 20

if not "%~4"=="" (
    set /a result = %result% + 40
)
set /a fail = ^(%3 + %2^) / 2

echo  result %result% fail %fail%

if %result% gtr %fail% (
    echo End job
    exit /b 0
) else (
    echo ERROR: Job failed
    exit /b 1
)
