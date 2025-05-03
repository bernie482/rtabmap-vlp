#include <stdio.h>
#include <stdlib.h>
int main(void){
	char ch;
	printf("請輸入一個字元:　");
	ch = getchar();
	printf("您輸入的字元是: ");
	putchar(ch);
	putchar('\n');
	
	system("pause");
	return 0;
} 
