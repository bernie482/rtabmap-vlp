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
	printf("counter()�w�g�I�s%d���F\n",i+1);
	i++;
}
