#include<stdio.h>
#include<stdlib.h>
int fib(int);
void counter(void);
int main(void){
	//int n;
	//for(n = 1; n<=5; n++){
	//	printf("fib(%d) = %d\n", n, fib(n));
	//}
	fib(5);
	system("pause");
	return 0;
}
int fib(int n){
	counter();
	if(n == 1 || n == 2)
	   return 1;
	else 
	   return (fib(n-1) + fib(n-2));
}
void counter(void){
	static int i = 0;
	printf("counter()已經呼叫%d次了\n",i+1);
	i++;
}
