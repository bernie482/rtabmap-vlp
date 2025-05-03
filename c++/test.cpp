#include <iostream>
#include <cstdio>  // 用於輸出十六進制
using namespace std;

int main() {
   const char* filename = "xx.txt";
   FILE *file = fopen(filename,"r");

   if(file == NULL){
     cout << "無法開啟檔案：" << filename << endl;
     return 1;  // 返回錯誤代碼
   }
   char buffer[256];

   while (fgets(buffer,sizeof(buffer),file)){
    cout << buffer ;
   }

   fclose(file);

    return 0;
}
