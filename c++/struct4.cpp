#include <stdlib.h>
#include <stdio.h>
struct data {
	char name[10];
	int math;	
}student[5] = {{"bernie", 90}, {"jack", 40}, {"mavis", 70}, {"bob", 55}, {"lily", 26}};
int main(void){
	int sum = 0;
	struct data *ptr;
	ptr = student;
	for(int i = 0; i < 5; i++){
		sum += (ptr+i)-> math;
	}
	printf("%2.2f",(float)sum/2);
	printf("\n");
	system("pause");
	return 0;
} 
