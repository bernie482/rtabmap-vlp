#include<stdio.h>
#include<stdlib.h>
void counter(void);
int main(void){
	counter();
	counter();
	system("pause");
	return 0;
}
void counter(void){
	static int i = 0;
	printf("counter()已經呼叫%d次了\n",i+1);
	i++;
}
