#include<stdio.h>
#include<stdlib.h>
int sum (int);
int main(void){
 int Sum = 0;
 Sum = sum(20);
 printf("sum is = %d\n", Sum);
 system("pause");
 return 0;
} 
int sum (int n){
	if(n == 1)
		return 1;
	else
	    return n+sum(n-1); 
}
