@echo off
 
setlocal enabledelayedexpansion
 
set /a i=41
for %%f in (*.jpg) do (
  ren %%f vid-!i!.jpg
  
  set /a i=!i!+1
)