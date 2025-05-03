#include<stdio.h>
#include<stdlib.h>
#define FUNC_D(x) 4*((x)*(x))+(6*(x))-5
int main (void){
	printf("f(1.0) is : %4.2f\n", FUNC_D(1.0));
	printf("f(2.2) is : %4.2f\n", FUNC_D(2.2));
	printf("f(3.14) is : %4.2f\n", FUNC_D(3.14));
	
	system("pause");
	return 0;
}
