#include <stdio.h>
#include <stdlib.h>
#include <windows.h>

#define BUFFER_SIZE 25

int main(void)
{
    HANDLE ReadHandle, WriteHandle;
    STARTUPINFO si;
    PROCESS_INFORMATION pi;
    char message[BUFFER_SIZE] = "Greetings";
    DWORD written;
    SECURITY_ATTRIBUTES sa = {sizeof(SECURITY_ATTRIBUTES), NULL, TRUE};
    ZeroMemory(&pi, sizeof(pi));
    ZeroMemory(&si, sizeof(si));

    // 建立匿名管道
    if (!CreatePipe(&ReadHandle, &WriteHandle, &sa, 0))
    {
        fprintf(stderr, "Create Pipe Failed\n");
        return 1;
    }

    GetStartupInfo(&si);
    si.hStdOutput = GetStdHandle(STD_OUTPUT_HANDLE);
    si.hStdInput = ReadHandle;
    si.dwFlags = STARTF_USESHOWWINDOW | STARTF_USESTDHANDLES;

    char cmd[] = "d:\\c++\\child.exe";

    if (!CreateProcess(NULL, cmd, NULL, NULL, TRUE, 0, NULL, NULL, &si, &pi))
    {
        fprintf(stderr, "CreateProcess failed. Error: %d\n", GetLastError());
        return 1;
    }

    CloseHandle(ReadHandle);

    // 只寫入真正的字串長度
    if (!WriteFile(WriteHandle, message, strlen(message) + 1, &written, NULL))
    {
        fprintf(stderr, "Error writing to pipe.\n");
    }

    CloseHandle(WriteHandle);
    WaitForSingleObject(pi.hProcess, INFINITE);
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
    system("pause");
    return 0;
}
