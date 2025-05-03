#include<stdio.h>
#include<stdlib.h>
#define CUBIC(X) (X)*(X)*(X)
int main (void){
	printf("f(5) is : %d\n", CUBIC(5));
	printf("f(2.4) is : %3.4f\n", CUBIC(2.4));
	system("pause");
	return 0;
}
