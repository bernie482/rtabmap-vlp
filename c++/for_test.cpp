#include<stdio.h>
#include<stdlib.h>

int main(void){
int nums;
int sum = 0;
for(int i = 1; i <= 100; i++){
	if((i % 3 == 0 )&& (i % 8 == 0)){
		sum += i;
		printf("sum is = %d\n", sum);
	}
}
//printf("sum is = %d\n", sum);
 system("pause");
 return 0;
} 
