#include <iostream>
#include <cstdio>  // �Ω��X�̤��i��
using namespace std;

int main() {
   const char* filename = "xx.txt";
   FILE *file = fopen(filename,"r");

   if(file == NULL){
     cout << "�L�k�}���ɮסG" << filename << endl;
     return 1;  // ��^���~�N�X
   }
   char buffer[256];

   while (fgets(buffer,sizeof(buffer),file)){
    cout << buffer ;
   }

   fclose(file);

    return 0;
}
