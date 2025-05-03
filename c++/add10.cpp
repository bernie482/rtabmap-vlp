#include<stdio.h>
#include<stdlib.h>
void add10(int *,int *);
int main(void){
	int a=3, b=5;
	printf("呼叫add10()之前: ");
	printf("a =%d, b =%d\n", a,b);
	add10(&a,&b);
	printf("呼叫add10()之後: ");
	printf("a =%d, b =%d\n", a,b); 
	system("pause");
	return 0;
}
void add10(int *ptr, int *ptr1){
	*ptr = *ptr + 10;
	*ptr1 = *ptr1 + 10; 
}
