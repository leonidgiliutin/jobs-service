@echo off

setlocal EnableDelayedExpansion

if "%~1"=="" (
    echo Usage: .\add_jobs.bat {num} , num is the number of jobs to be added
    exit /b
)
REM Loop from 1 to 10
for /L %%i in (1,1,%1) do (
    echo:
    echo Sending POST request %%i
    REM Generate random time between 1 and 20 seconds
    set /a complexity=!random! %% 100 + 1
    set /a fail=!random! %% 100 + 1
    curl -X POST -H "Content-Type: application/json" -d "{""name"": ""task-%%i"", ""args"": {""complexity"": ""!complexity!"", ""failProbability"": ""!fail!""}}" "http://localhost:3000/api/jobs"
    timeout /t 1 >nul
)
echo:
echo Done.
