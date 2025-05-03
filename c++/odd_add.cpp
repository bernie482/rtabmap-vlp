#include<stdio.h>
#include<stdlib.h>

int main(void){
int nums;
int sum = 0;
scanf("%d", &nums);
if(nums%2 == 0)
printf("enter odd number\n");   
else{
	for(int i = 1; i <= nums; i = i + 2){
		sum += i;
	}
	printf("sum is = %d\n", sum);
 }
 system("pause");
 return 0;
} 
