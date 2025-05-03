#include <stdio.h>
#include <stdlib.h>
int main(void){
	char str[25];
	char str2[25];
	char str3[25];
	
	printf("Input a string:");
	scanf("%s" ,str);
	
	printf("Input a string:");
	scanf("%s" ,str2);
	
	printf("Input a string:");
	scanf("%s" ,str3);
	
	printf("The string is %s %s %s\n" ,str,str2,str3);

	system("pause");
	return 0;
}
