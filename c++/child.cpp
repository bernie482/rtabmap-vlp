#include <stdio.h>
#include <windows.h>

#define BUFFER_SIZE 25

int main(void){
    HANDLE Readhandle;
    CHAR buffer[BUFFER_SIZE];
    DWORD read;
     
      Readhandle =GetStdHandle(STD_INPUT_HANDLE);

      if(ReadFile(Readhandle, buffer, BUFFER_SIZE, &read, NULL))
        printf("Child read %s\n", buffer);
      else
        fprintf(stderr, "Error reading from pipe");
      return 0 ;
}