#include<stdio.h>
#include<stdlib.h>

int main(void){
int sum = 0;
for(int i = 1; i <= 50; i++){
	if(i%2 == 0){
		sum -= i * i;
		//printf("sum is = %d\n", sum);
	}
	else{
		sum += i * i; 
		//printf("sum is = %d\n", sum);
	}
}
 printf("sum is = %d\n", sum);
 system("pause");
 return 0;
} 
